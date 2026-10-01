import { EObject, EStructuralFeature } from '@typemf/core';
import React from 'react';
import { displayLabel } from '../src/display-label.js';
import { FeatureEditor } from './FeatureEditor.js';
import { useObjectVersion } from './hooks.js';
import { WebviewEnvironment } from './webview-environment.js';

export interface PropertiesPanelProps {
  obj: EObject | undefined;
  environment: WebviewEnvironment;
  onFollowReference: (target: EObject) => void;
  showDerivedFeatures: boolean;
}

export function PropertiesPanel({ obj, environment, onFollowReference, showDerivedFeatures }: PropertiesPanelProps): React.JSX.Element {
  // Re-renders this whole panel (and so every FeatureEditor below it) whenever the selected
  // object's own data changes - including from the very eSet() call one of those editors just
  // made itself. Must be called unconditionally, before the early return below (React's own
  // rules of hooks) - useObjectVersion already handles obj being undefined internally.
  useObjectVersion(obj);

  if (!obj) {
    return (
      <div className="properties-panel properties-panel-empty">
        <p>Select an element in the tree to edit it.</p>
      </div>
    );
  }

  // Sorted by name for easier scanning - getEAllStructuralFeatures() itself returns them in
  // declaration order (own features first, then each supertype's own), which is meaningful for
  // code generation but not especially helpful for finding a specific feature by eye in a panel
  // that can easily hold a few dozen of them. Derived features are filtered out entirely unless
  // the "Show derived features" setting is on (off by default) - a derived feature is read-only
  // in every case anyway (see FeatureEditor's own handling), so hiding it by default is mostly
  // about cutting down on clutter, not about preventing any particular action.
  const features = [...obj.eClass().getEAllStructuralFeatures()]
    .filter((f) => showDerivedFeatures || !f.isDerived())
    .sort((a, b) => (a.getName() ?? '').localeCompare(b.getName() ?? ''));

  return (
    <div className="properties-panel">
      <h2 className="properties-title">{displayLabel(obj)}</h2>
      <p className="properties-subtitle">{obj.eClass().getName()}</p>
      <table className="properties-table">
        <tbody>
          {features.map((feature) => {
            const name = feature.getName();
            if (!name) return null;
            return (
              <tr key={name}>
                <th className="properties-label">
                  {name}
                  {feature.isDerived() && (
                    <span className="properties-derived-marker" title="Derived - computed, not independently stored">
                      {' '}
                      (derived)
                    </span>
                  )}
                </th>
                <td className="properties-value">
                  {/* A feature this object can't actually report a value for (a read-only/
                      impl-only one - see trySet's own reasoning in snapshot-serializer.ts) is
                      skipped rather than shown broken; eGet itself is what would throw. */}
                  <SafeFeatureEditor obj={obj} feature={feature} environment={environment} onFollowReference={onFollowReference} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SafeFeatureEditor({
  obj,
  feature,
  environment,
  onFollowReference,
}: {
  obj: EObject;
  feature: EStructuralFeature;
  environment: WebviewEnvironment;
  onFollowReference: (target: EObject) => void;
}): React.JSX.Element {
  try {
    obj.eGet(feature); // probe - throws for a feature this object can't actually report
  } catch {
    return <span className="feature-readonly-empty">(not shown)</span>;
  }
  return <FeatureEditor obj={obj} feature={feature} environment={environment} onFollowReference={onFollowReference} />;
}
