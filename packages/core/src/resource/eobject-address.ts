import { EObject } from '../metamodel/types/EObject.js';

/**
 * The fragment addressing `target` among `roots`, without the leading `#`: its `fullId()` if it
 * has an ID attribute set (e.g. `Book_Dune`), otherwise its containment path (`/0/books/2`: root
 * 0, feature `books`, index 2). This is the default fragment grammar of every serializer that does
 * not define its own. A path changes when an element before it is moved, so give objects that are
 * referenced across documents an ID attribute.
 *
 * @throws Error if `target` is not contained in one of `roots`.
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

/**
 * The object `fragment` addresses among `roots`; the counterpart of {@link computeFragment}.
 *
 * @returns `undefined` if no object has the ID.
 * @throws Error if a containment path does not lead to an object.
 */
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
    const featureName = feature.getName();
    if (featureName === undefined) {
      throw new Error('The containing feature has no name - cannot build a positional path segment for it.');
    }
    segments.unshift(featureName);
    current = container;
    container = current.eContainer();
  }

  const rootIndex = roots.indexOf(current);
  if (rootIndex === -1) {
    throw new Error(
      'Target object is not reachable from the given roots via containment - cannot address it positionally.'
    );
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
    const feature = current.eClass().getEStructuralFeature(featureName);
    if (!feature) {
      throw new Error(`Positional path '${path}': '${current.eClass().getName()}' has no feature '${featureName}'.`);
    }
    i += 1;

    if (feature.isMany()) {
      const indexSegment = segments[i];
      const index = Number(indexSegment);
      if (indexSegment === undefined || !Number.isInteger(index)) {
        throw new Error(
          `Positional path '${path}': expected an array index after many-valued feature '${featureName}'.`
        );
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
