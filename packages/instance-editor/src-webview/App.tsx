import { EObject } from '@typemf/core';
import React, { useEffect, useState } from 'react';
import { PropertiesPanel } from './PropertiesPanel.js';
import { Tree } from './Tree.js';
import { useResolvedById } from './hooks.js';
import { WebviewEnvironment } from './webview-environment.js';

export interface AppProps {
  environment: WebviewEnvironment;
  rootId: string | undefined;
  showDerivedFeatures: boolean;
}

export function App({ environment, rootId, showDerivedFeatures }: AppProps): React.JSX.Element {
  const { resourceSet, objectRegistry, ancestorChainQuery } = environment;
  const root = useResolvedById(rootId, resourceSet);
  const [selected, setSelected] = useState<EObject | undefined>(undefined);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const selectedId = selected ? objectRegistry.hostIdFor(selected) : undefined;

  // The root starts expanded, same as before this was lifted out of Tree's own per-node state -
  // added once, the first moment its id is actually known (rootId alone isn't enough; the root
  // itself has to have been resolved for hostIdFor to work).
  useEffect(() => {
    if (!root) return;
    const id = objectRegistry.hostIdFor(root);
    if (id) setExpandedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, [root, objectRegistry]);

  const toggleExpand = (id: string): void => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /**
   * "Follow reference": expand every ancestor of `target` (so it's actually visible once the
   * tree re-renders) and select it - the query itself only @typemf/core's real, connected
   * eContainer() chain can answer, host-side (see AncestorChainRequest's own reasoning for why
   * this can't be done locally on the webview side at all).
   */
  const followReference = async (target: EObject): Promise<void> => {
    const targetId = objectRegistry.hostIdFor(target);
    if (!targetId) return; // not a real, host-backed object (shouldn't happen for anything reachable via a reference) - nothing to follow
    let chainIds: string[];
    try {
      chainIds = await ancestorChainQuery.query(targetId);
    } catch (err) {
      console.error(`Failed to follow reference: ${(err as Error).message}`);
      return;
    }
    const ancestorIds = chainIds.slice(0, -1); // every id except the target's own last one
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const id of ancestorIds) next.add(id);
      return next;
    });
    setSelected(target);
  };

  if (!rootId) {
    return (
      <div className="app app-empty">
        <p>This document has no root element yet.</p>
      </div>
    );
  }

  if (!root) {
    return (
      <div className="app app-loading">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-tree-pane">
        <Tree
          root={root}
          resourceSet={resourceSet}
          objectRegistry={objectRegistry}
          selectedId={selectedId}
          onSelect={setSelected}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
        />
      </div>
      <div className="app-properties-pane">
        <PropertiesPanel obj={selected} environment={environment} onFollowReference={followReference} showDerivedFeatures={showDerivedFeatures} />
      </div>
    </div>
  );
}
