import { EObject, EStructuralFeature, EClass, EAttribute, isEModelElement, isENamedElement } from '@typemf/core';

/**
 * Own + inherited structural features/attributes, computed manually by
 * walking getEStructuralFeatures() (own-only) up through getESuperTypes()
 * (single-level, direct supertypes) - not eClass.getEAllStructuralFeatures()/
 * getEAllAttributes() directly. Shared with xmi-serializer.ts, which has
 * the full explanation in its own doc comment: those methods are empty
 * on self-hosted, generated classifier metaclasses (one of the "~14
 * traversal-based derived features" that are stored fields on generated
 * classes, never auto-computed, since Pass 5/recomputeAllLists() is
 * deliberately skipped for them - see the generator's own NOTES.md).
 * getEStructuralFeatures() and getESuperTypes() are both real, populated
 * fields regardless of whether the metamodel in use is self-hosted or
 * hand-written, so this works correctly either way.
 */
export function allStructuralFeaturesOf(eClass: EClass): EStructuralFeature[] {
  const seen = new Set<EClass>();
  const result: EStructuralFeature[] = [];
  function visit(c: EClass): void {
    if (seen.has(c)) return;
    seen.add(c);
    for (const parent of c.getESuperTypes()) visit(parent);
    result.push(...c.getEStructuralFeatures());
  }
  visit(eClass);
  return result;
}

export function allAttributesOf(eClass: EClass): EAttribute[] {
  return allStructuralFeaturesOf(eClass).filter((f): f is EAttribute => !('isContainment' in f));
}

/**
 * EMF's actual default fragment grammar - deliberately a separate
 * implementation from @typemf/core's computeFragment()/resolveFragment(),
 * not a shared refactor of it, per the decision to keep @typemf/xmi
 * self-contained. The underlying idea (walk containment, address by
 * feature+index, prefer an ID attribute when present) is the same one;
 * only the string grammar differs, to match what real EMF actually
 * produces and expects:
 *
 *   - single-root document, target is a descendant: "//@feature.index"
 *     (many-valued) or "//@feature" (single-valued), one such segment per
 *     containment step, joined by "/"
 *   - single-root document, target IS the root: "/"
 *   - multi-root document: same, but prefixed with "/<rootIndex>" instead
 *     of the bare "/"
 *   - an object whose EClass has an ID attribute set: the ID value itself,
 *     with no leading "/" at all (e.g. "myBookId123")
 *   - a named Ecore element inside another Ecore element (a classifier, a
 *     subpackage, a feature, an operation, ...): its name instead of
 *     "@feature.index", as in "//api/Solution" or "//Book/title", with ".n"
 *     appended when n earlier siblings have the same name (see
 *     nameSegmentAmong)
 *
 * Positional forms are fragile to reordering, same as @typemf/core's - an
 * ID attribute is preferred whenever the target EClass has one.
 */
export function computeEmfFragment(target: EObject, roots: EObject[]): string {
  const idAttribute = allAttributesOf(target.eClass()).find((attr) => attr.isID());
  if (idAttribute && target.eIsSet(idAttribute)) {
    return String(target.eGet(idAttribute));
  }

  const segments: string[] = [];
  let current = target;
  let container = current.eContainer();

  while (container) {
    const feature = current.eContainingFeature();
    if (!feature) {
      throw new Error('Object has a container but no containing feature - inconsistent containment state.');
    }
    const named = nameSegment(current, container);
    if (named !== undefined) {
      segments.unshift(named);
      current = container;
      container = current.eContainer();
      continue;
    }
    let segment = `@${feature.getName()}`;
    if (feature.isMany()) {
      const siblings = [...(container.eGet(feature) as Iterable<EObject>)];
      const index = siblings.indexOf(current);
      if (index === -1) {
        throw new Error(`Object not found within its own containing feature '${feature.getName()}'.`);
      }
      segment += `.${index}`;
    }
    segments.unshift(segment);
    current = container;
    container = current.eContainer();
  }

  const rootIndex = roots.indexOf(current);
  if (rootIndex === -1) {
    throw new Error('Target object is not reachable from the given roots via containment.');
  }

  const path = segments.join('/');
  if (roots.length === 1) {
    return path === '' ? '/' : `//${path}`;
  }
  return path === '' ? `/${rootIndex}` : `/${rootIndex}/${path}`;
}

/**
 * The segment that addresses `target` within `container` by name, as EMF does for named Ecore
 * elements, or undefined if it is addressed by position. See {@link nameSegmentAmong}.
 */
function nameSegment(target: EObject, container: EObject): string | undefined {
  if (!isENamedElement(target) || !isEModelElement(container)) return undefined;
  return nameSegmentAmong(target, container.eContents());
}

/**
 * The name segment of `target` among `siblings`, the contents of its container in order: its name,
 * followed by ".n" when n earlier siblings have the same name (EMF's convention, e.g. for
 * overloaded operations). Undefined for a name that a segment can't hold.
 */
export function nameSegmentAmong(target: EObject, siblings: Iterable<EObject>): string | undefined {
  const name = nameOf(target);
  if (typeof name !== 'string' || name === '' || /^[@%]|[\s/#]/.test(name)) return undefined;
  let count = 0;
  for (const sibling of siblings) {
    if (sibling === target) return count > 0 ? `${name}.${count}` : name;
    if (nameOf(sibling) === name) count++;
  }
  return undefined;
}

/** The inverse of computeEmfFragment(). */
export function resolveEmfFragment(fragment: string, roots: EObject[]): EObject | undefined {
  if (fragment === '/') {
    return roots.length === 1 ? roots[0] : undefined;
  }
  if (fragment.startsWith('//')) {
    if (roots.length !== 1) return undefined;
    return walkSegments(fragment.slice(2), roots[0]!);
  }
  if (fragment.startsWith('/')) {
    const rest = fragment.slice(1);
    const slashIndex = rest.indexOf('/');
    const rootIndexToken = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
    const rootIndex = Number(rootIndexToken);
    if (!Number.isInteger(rootIndex) || rootIndex < 0 || rootIndex >= roots.length) return undefined;
    const root = roots[rootIndex]!;
    if (slashIndex === -1) return root;
    return walkSegments(rest.slice(slashIndex + 1), root);
  }
  // Bare token: an ID-attribute value.
  return findByIdValue(fragment, roots);
}

/**
 * Follows a path of segments from `start`. A segment starting with "@" is a containment step,
 * "@feature" or "@feature.index"; any other segment is the name of a contained element, as in
 * EMF's paths into .ecore files ("//api/Solution", "//EModelElement/eAnnotations").
 */
function walkSegments(path: string, start: EObject): EObject | undefined {
  let current: EObject | undefined = start;
  for (const segment of path.split('/')) {
    if (!current) return undefined;
    current = segment.startsWith('@') ? containmentStep(current, segment) : namedChild(current, segment);
  }
  return current;
}

function containmentStep(current: EObject, segment: string): EObject | undefined {
  const dotIndex = segment.indexOf('.');
  const featureName = dotIndex === -1 ? segment.slice(1) : segment.slice(1, dotIndex);
  const feature = allStructuralFeaturesOf(current.eClass()).find((f) => f.getName() === featureName);
  if (!feature) return undefined;
  if (!feature.isMany()) return current.eGet(feature) as EObject | undefined;
  const index = Number(dotIndex === -1 ? undefined : segment.slice(dotIndex + 1));
  if (!Number.isInteger(index)) return undefined;
  return [...(current.eGet(feature) as Iterable<EObject>)][index];
}

/**
 * The object directly contained in `container` that a name segment addresses: "name" is the first
 * with that name, "name.n" the one after n others with that name. A segment that only reads as
 * "name.n" because the name itself ends that way is also found.
 */
function namedChild(container: EObject, segment: string): EObject | undefined {
  const counted = /^(.*)\.(\d+)$/.exec(segment);
  return (counted && nthNamedChild(container, counted[1]!, Number(counted[2]))) || nthNamedChild(container, segment, 0);
}

function nthNamedChild(container: EObject, name: string, n: number): EObject | undefined {
  let remaining = n;
  for (const child of container.eContents()) {
    if (nameOf(child) !== name) continue;
    if (remaining === 0) return child;
    remaining--;
  }
  return undefined;
}

function nameOf(obj: EObject): unknown {
  const nameFeature = allStructuralFeaturesOf(obj.eClass()).find((f) => f.getName() === 'name');
  return nameFeature ? obj.eGet(nameFeature) : undefined;
}

function findByIdValue(idValue: string, roots: EObject[]): EObject | undefined {
  for (const root of roots) {
    const found = findByIdValueIn(root, idValue);
    if (found) return found;
  }
  return undefined;
}

function findByIdValueIn(obj: EObject, idValue: string): EObject | undefined {
  const idAttribute = allAttributesOf(obj.eClass()).find((attr) => attr.isID());
  if (idAttribute && obj.eIsSet(idAttribute) && String(obj.eGet(idAttribute)) === idValue) {
    return obj;
  }
  for (const child of obj.eContents()) {
    const found = findByIdValueIn(child, idValue);
    if (found) return found;
  }
  return undefined;
}
