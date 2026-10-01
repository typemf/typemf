import { EObject } from '@typemf/core';

/**
 * A human-readable label for a tree node or reference picker entry: the object's own "name"
 * feature value if it has one and it's set (the common convention - ENamedElement-derived
 * classes, and most hand-modeled metamodels, follow this), otherwise its class name.
 */
export function displayLabel(obj: EObject): string {
  const nameFeature = obj.eClass().getEStructuralFeature('name');
  if (nameFeature && !nameFeature.isMany()) {
    const value = obj.eGet(nameFeature);
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return obj.eClass().getName() ?? '(unnamed class)';
}
