import { EList, EObject, isEReference, ResourceSet } from '@typemf/core';
import React, { useEffect, useRef } from 'react';
import { displayLabel } from '../src/display-label.js';
import { WebviewObjectRegistry } from '../src/webview-object-registry.js';
import { useObjectVersion, useResolved } from './hooks.js';

export interface TreeProps {
  root: EObject;
  resourceSet: ResourceSet;
  objectRegistry: WebviewObjectRegistry;
  selectedId: string | undefined;
  onSelect: (obj: EObject) => void;
  /**
   * Which nodes are expanded, by host id - lifted out of each node's own local state (the
   * earlier design) specifically so "follow reference" can force-expand a whole ancestor chain
   * from outside the tree entirely, not just toggle one node at a time from a click inside it.
   * The root's own id is expected to already be in this set from the start (App.tsx's own
   * responsibility, once it knows the root's id) - nothing here adds it automatically.
   */
  expandedIds: ReadonlySet<string>;
  onToggleExpand: (id: string) => void;
}

export function Tree({
  root,
  resourceSet,
  objectRegistry,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
}: TreeProps): React.JSX.Element {
  return (
    <div className="tree">
      <TreeNode
        obj={root}
        parent={undefined}
        resourceSet={resourceSet}
        objectRegistry={objectRegistry}
        selectedId={selectedId}
        onSelect={onSelect}
        expandedIds={expandedIds}
        onToggleExpand={onToggleExpand}
        depth={0}
      />
    </div>
  );
}

/** Every containment feature (single or many-valued) an object has - the tree's own edges. */
function containmentFeatures(obj: EObject) {
  return obj
    .eClass()
    .getEAllStructuralFeatures()
    .filter((f) => isEReference(f) && f.isContainment());
}

/** The raw child values (EObjects or still-unresolved proxies) across every containment feature,
 *  in feature-declaration order - resolving each one is TreeNode's own, later responsibility. */
function containmentChildren(obj: EObject): EObject[] {
  const children: EObject[] = [];
  for (const feature of containmentFeatures(obj)) {
    const value = obj.eGet(feature);
    if (feature.isMany()) children.push(...[...(value as EList<EObject>)]);
    else if (value !== undefined) children.push(value as EObject);
  }
  return children;
}

interface TreeNodeProps {
  obj: EObject; // already resolved
  /** Undefined only for the root - needed so ArrowLeft on an already-collapsed (or childless)
   *  node can move selection up to it, matching standard tree-view keyboard conventions. */
  parent: EObject | undefined;
  resourceSet: ResourceSet;
  objectRegistry: WebviewObjectRegistry;
  selectedId: string | undefined;
  onSelect: (obj: EObject) => void;
  expandedIds: ReadonlySet<string>;
  onToggleExpand: (id: string) => void;
  depth: number;
}

function TreeNode({
  obj,
  parent,
  resourceSet,
  objectRegistry,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  depth,
}: TreeNodeProps): React.JSX.Element {
  // Re-renders this node whenever the object's own data changes - e.g. editing "name" in the
  // properties panel should update this node's own displayLabel() without needing anything else
  // to happen first.
  useObjectVersion(obj);
  const children = containmentChildren(obj);
  const hasChildren = children.length > 0;
  const myId = objectRegistry.hostIdFor(obj);
  const expanded = myId !== undefined && expandedIds.has(myId);
  const isSelected = myId !== undefined && myId === selectedId;
  const rowRef = useRef<HTMLDivElement>(null);

  // Focus AND scroll follow selection, whatever triggered it (a click, a keyboard move, or a
  // "follow reference" jump from the properties panel) - what makes both ArrowRight/ArrowLeft and
  // the follow button actually usable without a separate click/manual scroll afterward.
  useEffect(() => {
    if (isSelected) rowRef.current?.scrollIntoView({ block: 'nearest' });
    if (isSelected) rowRef.current?.focus();
  }, [isSelected]);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (hasChildren && !expanded && myId !== undefined) {
        onToggleExpand(myId);
      } else if (hasChildren && expanded && children.length > 0) {
        onSelect(children[0]!);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (expanded && myId !== undefined) {
        onToggleExpand(myId);
      } else if (parent) {
        onSelect(parent);
      }
    }
  };

  return (
    <div>
      <div
        ref={rowRef}
        className={`tree-row${isSelected ? ' tree-row-selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        tabIndex={0}
        onClick={() => onSelect(obj)}
        onKeyDown={handleKeyDown}
      >
        {hasChildren ? (
          <button
            className="tree-toggle"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              if (myId !== undefined) onToggleExpand(myId);
            }}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="tree-toggle-spacer" />
        )}
        <span className="tree-label">{displayLabel(obj)}</span>
      </div>
      {expanded &&
        children.map((child, index) => (
          <ResolvedTreeNode
            key={index}
            objOrProxy={child}
            parent={obj}
            resourceSet={resourceSet}
            objectRegistry={objectRegistry}
            selectedId={selectedId}
            onSelect={onSelect}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

/** Resolves a possibly-still-proxied child before it can be rendered as a real TreeNode - the
 *  actual lazy-loading moment: nothing beyond this point fetches anything until a node is
 *  genuinely expanded and its children are genuinely about to be shown. */
function ResolvedTreeNode(props: Omit<TreeNodeProps, 'obj'> & { objOrProxy: EObject }): React.JSX.Element {
  const resolved = useResolved(props.objOrProxy, props.resourceSet);
  if (!resolved) {
    return (
      <div className="tree-row tree-row-loading" style={{ paddingLeft: `${props.depth * 16 + 4}px` }}>
        Loading…
      </div>
    );
  }
  return <TreeNode {...props} obj={resolved} />;
}
