import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { EList, EObject, ResourceSet } from '@typemf/core';
import { uriForId } from '../src/snapshot-serializer.js';

/**
 * Re-renders the component whenever a feature of `obj` changes, and returns a counter that
 * increases with every change. EObjects change outside of React, so components that show their
 * values need this to stay current.
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
 * Returns `objOrProxy` itself if it is not a proxy, otherwise its resolved target. Returns
 * `undefined` while resolving and if resolving fails.
 */
export function useResolved(objOrProxy: EObject | undefined, resourceSet: ResourceSet): EObject | undefined {
  const [result, setResult] = useState<{ for: EObject; value: EObject | undefined }>();

  useEffect(() => {
    if (!objOrProxy?.eIsProxy()) return;
    let cancelled = false;
    resourceSet
      .resolve(objOrProxy)
      .then((value) => {
        if (!cancelled) setResult({ for: objOrProxy, value });
      })
      .catch(() => {
        if (!cancelled) setResult({ for: objOrProxy, value: undefined });
      });
    return () => {
      cancelled = true;
    };
  }, [objOrProxy, resourceSet]);

  if (!objOrProxy?.eIsProxy()) return objOrProxy;
  return result?.for === objOrProxy ? result.value : undefined;
}

/**
 * Returns the items of `list` with every proxy replaced by its resolved target. Until the proxies
 * are resolved, and for proxies that fail to resolve, the proxy itself is returned. `version` must
 * change whenever the list changes; use {@link useObjectVersion} of the list's owner.
 */
export function useResolvedList(list: EList<EObject>, version: number, resourceSet: ResourceSet): EObject[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` stands for the list contents
  const items = useMemo(() => [...list], [list, version]);
  const [result, setResult] = useState<{ for: EObject[]; value: EObject[] }>();

  useEffect(() => {
    const proxies = items.filter((item) => item.eIsProxy());
    if (proxies.length === 0) return;
    let cancelled = false;
    Promise.all(
      proxies.map((proxy) =>
        resourceSet
          .resolve(proxy)
          .then((resolved) => [proxy, resolved] as const)
          .catch(() => [proxy, undefined] as const)
      )
    ).then((pairs) => {
      if (cancelled) return;
      const byProxy = new Map(pairs);
      setResult({ for: items, value: items.map((item) => byProxy.get(item) ?? item) });
    });
    return () => {
      cancelled = true;
    };
  }, [items, resourceSet]);

  return result?.for === items ? result.value : items;
}

/** Loads the object with the host id `id`. Returns `undefined` while loading and if loading fails. */
export function useResolvedById(id: string | undefined, resourceSet: ResourceSet): EObject | undefined {
  const [result, setResult] = useState<{ for: string; value: EObject | undefined }>();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    resourceSet
      .getResource(uriForId(id), true)
      .then((resource) => {
        if (cancelled) return;
        const contents = resource?.getContents();
        setResult({ for: id, value: contents && !contents.isEmpty() ? contents.get(0) : undefined });
      })
      .catch(() => {
        if (!cancelled) setResult({ for: id, value: undefined });
      });
    return () => {
      cancelled = true;
    };
  }, [id, resourceSet]);

  return id !== undefined && result?.for === id ? result.value : undefined;
}
