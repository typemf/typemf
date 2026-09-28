import { EStructuralFeatureImpl } from '../metamodel/impl/EStructuralFeatureImpl.js';
import { EObject } from '../metamodel/types/EObject.js';

/**
 * Computes a fragment addressing `target` relative to `roots` - the bare
 * fragment text a serializer puts after "#" (same-resource) or "uri#"
 * (cross-resource), with no leading "#" itself.
 *
 * Prefers the ID-attribute form (fullId(), e.g. "Book_Dune") whenever the
 * target has one set; falls back to a positional, JSON-Pointer-shaped path
 * ("/0/books/2": root 0's "books" feature, index 2) computed via
 * containment when it doesn't. This is genuinely format-agnostic - any
 * EObjectSerializer (JSON, XMI, ...) that wants "#id-or-path" addressing
 * uses this and resolveFragment() rather than reimplementing it, which is
 * also what lets ResourceSet.resolve() understand fragments regardless of
 * which serializer produced them.
 *
 * The positional fallback has the same trade-off as EMF's own positional
 * "e-path" fragments (#//@classifiers.2): it breaks if anything earlier in
 * the same containment chain is reordered later. Prefer giving
 * cross-referenced EClasses an ID attribute wherever practical.
 */
export function computeFragment(target: EObject, roots: EObject[]): string {
  const idAttribute = target
    .eClass()
    .getEAllAttributes()
    .find((attr) => attr.isID());
  if (idAttribute && target.eIsSet(idAttribute)) {
    return target.fullId();
  }
  return computePositionalPath(target, roots);
}

/** The inverse of computeFragment(): resolves a "#"-less fragment against `roots`. */
export function resolveFragment(fragment: string, roots: EObject[]): EObject | undefined {
  if (fragment.startsWith('/')) {
    return resolvePositionalPath(fragment, roots);
  }
  return findByFullId(fragment, roots);
}

function findByFullId(fullId: string, roots: EObject[]): EObject | undefined {
  for (const root of roots) {
    if (root.fullId() === fullId) return root;
    const match = root.eAllContents().find((obj) => obj.fullId() === fullId);
    if (match) return match;
  }
  return undefined;
}

function computePositionalPath(target: EObject, roots: EObject[]): string {
  const segments: string[] = [];
  let current = target;
  let container = current.eContainer();

  while (container) {
    const feature = current.eContainingFeature();
    if (!feature) {
      throw new Error('Object has a container but no containing feature - inconsistent containment state.');
    }
    if (feature.isMany()) {
      const siblings = [...(container.eGet(feature) as Iterable<EObject>)];
      const index = siblings.indexOf(current);
      if (index === -1) {
        throw new Error(`Object not found within its own containing feature '${feature.getName()}'.`);
      }
      segments.unshift(String(index));
    }
    segments.unshift(feature.getName() as string);
    current = container;
    container = current.eContainer();
  }

  const rootIndex = roots.indexOf(current);
  if (rootIndex === -1) {
    throw new Error('Target object is not reachable from the given roots via containment - cannot address it positionally.');
  }
  segments.unshift(String(rootIndex));
  return `/${segments.join('/')}`;
}

function resolvePositionalPath(path: string, roots: EObject[]): EObject {
  const segments = path.split('/').filter((s) => s.length > 0);
  if (segments.length === 0) {
    throw new Error(`Empty positional path.`);
  }

  const rootIndex = Number(segments[0]);
  if (!Number.isInteger(rootIndex) || rootIndex < 0 || rootIndex >= roots.length) {
    throw new Error(`Positional path '${path}': root index '${segments[0]}' is out of range.`);
  }
  let current: EObject = roots[rootIndex]!;

  let i = 1;
  while (i < segments.length) {
    const featureName = segments[i]!;
    const feature = current.eClass().getEStructuralFeatures().filter(feat => feat.getName() === featureName).at(0);
    if (!feature) {
      throw new Error(`Positional path '${path}': '${current.eClass().getName()}' has no feature '${featureName}'.`);
    }
    i += 1;

    if (feature.isMany()) {
      const indexSegment = segments[i];
      const index = Number(indexSegment);
      if (indexSegment === undefined || !Number.isInteger(index)) {
        throw new Error(`Positional path '${path}': expected an array index after many-valued feature '${featureName}'.`);
      }
      i += 1;
      const list = [...(current.eGet(feature) as Iterable<EObject>)];
      const next = list[index];
      if (!next) {
        throw new Error(`Positional path '${path}': index ${index} is out of range for '${featureName}'.`);
      }
      current = next;
    } else {
      current = current.eGet(feature) as EObject;
    }
  }

  return current;
}
