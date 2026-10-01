import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { EObject, ResourceSet } from '@typemf/core';
import { uriForId } from '../src/snapshot-serializer.js';

/**
 * Forces a re-render whenever `obj`'s own data changes (any feature). The real fix for a real
 * bug: eSet() mutates the EObject directly, entirely outside React's own rendering system - a
 * controlled <input value={...}> whose value is computed from obj.eGet(feature) would otherwise
 * never see that value change, since nothing triggers React to re-render and re-evaluate it.
 * Concretely, this is why typing into a feature editor didn't work at all: the DOM briefly shows
 * the keystroke (native browser behavior before React reconciles), then React's next render pass
 * reverts it, since the (still stale, pre-edit) `value` prop is the only thing React trusts.
 *
 * useSyncExternalStore, not a hand-rolled forceUpdate counter in a plain useState - the correct,
 * idiomatic React 18 primitive for "subscribe to an external, mutable data source and re-render
 * on change," avoiding the tearing issues a naive forceUpdate pattern can have under concurrent
 * rendering.
 */
export function useObjectVersion(obj: EObject | undefined): number {
  const versionRef = useRef(0);
  return useSyncExternalStore(
    (onStoreChange) => {
      if (!obj) return () => {};
      const subscription = obj.onDidChange(() => {
        versionRef.current++;
        onStoreChange();
      });
      return () => subscription.dispose();
    },
    () => versionRef.current
  );
}

/**
 * Resolves `objOrProxy` if it's still an unresolved proxy, otherwise returns it immediately -
 * undefined while a real fetch is pending. Explicit pending-state via useState/useEffect, not
 * React Suspense (throw-a-pending-promise): simpler, no Suspense boundaries needed anywhere in
 * this app. A deliberate choice for this first implementation - Suspense was the other real
 * option considered when this was first discussed, not obviously wrong, just not what's built
 * here.
 */
export function useResolved(objOrProxy: EObject | undefined, resourceSet: ResourceSet): EObject | undefined {
  const [resolved, setResolved] = useState<EObject | undefined>(objOrProxy && !objOrProxy.eIsProxy() ? objOrProxy : undefined);

  useEffect(() => {
    if (!objOrProxy) {
      setResolved(undefined);
      return;
    }
    if (!objOrProxy.eIsProxy()) {
      setResolved(objOrProxy);
      return;
    }
    let cancelled = false;
    setResolved(undefined);
    resourceSet
      .resolve(objOrProxy)
      .then((r) => {
        if (!cancelled) setResolved(r);
      })
      .catch(() => {
        if (!cancelled) setResolved(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [objOrProxy, resourceSet]);

  return resolved;
}

/**
 * Resolves every item of `items` that's still a proxy, re-rendering as each one completes -
 * ReferenceEditor's own multi-valued case (FeatureEditor.tsx) needs this, not useResolved: a
 * many-valued reference (e.g. EPackage.eClassifiers, EClass.eAnnotations) is a *list* of
 * possibly-still-proxy items, each needing its own resolution, not one single object. The real
 * fix for a real, reported bug: ReferenceEditor previously checked item.eIsProxy() directly,
 * synchronously, with nothing to ever trigger resolution or a re-render once it completed - a
 * proxy item showed "…" forever, never becoming its real display label, however long the panel
 * stayed open. Returns objects in the same order as `items`; a still-unresolved (or failed-to-
 * resolve) entry stays as its own original proxy in the result, exactly like useResolved's own
 * undefined-while-pending convention, just per-item instead of for one value - the caller decides
 * how to render that (ReferenceEditor's own "…" placeholder, unchanged).
 */
export function useResolvedList(items: EObject[], resourceSet: ResourceSet): EObject[] {
  const [resolved, setResolved] = useState<EObject[]>(items);
  const prevItemsRef = useRef<EObject[]>([]);

  useEffect(() => {
    // items is a fresh array every render (the caller spreads an EList each time), so bail out
    // here, inside the effect, unless its own contents actually differ element-wise from last
    // time - avoids re-resolving (and the resulting setState/render loop) on every unrelated
    // re-render this component happens to go through.
    const prev = prevItemsRef.current;
    const changed = items.length !== prev.length || items.some((item, i) => item !== prev[i]);
    if (!changed) return;
    prevItemsRef.current = items;

    setResolved(items);
    const proxies = items.filter((item) => item.eIsProxy());
    if (proxies.length === 0) return;

    let cancelled = false;
    Promise.all(
      proxies.map((proxy) =>
        resourceSet
          .resolve(proxy)
          .then((r) => [proxy, r] as const)
          .catch(() => [proxy, undefined] as const)
      )
    ).then((pairs) => {
      if (cancelled) return;
      const byProxy = new Map(pairs);
      setResolved(items.map((item) => byProxy.get(item) ?? item));
    });
    return () => {
      cancelled = true;
    };
  });

  return resolved;
}

/** The one place an object is ever resolved from a bare id rather than an EObject/proxy value -
 *  only the document's own root, delivered that way in the typemf/init message (see
 *  handle-ready-message.ts's own reasoning: nothing else identifies the root any other way). */
export function useResolvedById(id: string | undefined, resourceSet: ResourceSet): EObject | undefined {
  const [resolved, setResolved] = useState<EObject | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setResolved(undefined);
      return;
    }
    let cancelled = false;
    setResolved(undefined);
    resourceSet
      .getResource(uriForId(id), true)
      .then((resource) => {
        if (cancelled) return;
        const contents = resource?.getContents();
        setResolved(contents && !contents.isEmpty() ? contents.get(0) : undefined);
      })
      .catch(() => {
        if (!cancelled) setResolved(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [id, resourceSet]);

  return resolved;
}
