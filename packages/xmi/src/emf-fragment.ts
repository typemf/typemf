import { EObject, EStructuralFeature, EClass, EAttribute } from '@typemf/core';

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

/** The inverse of computeEmfFragment(). */
export function resolveEmfFragment(fragment: string, roots: EObject[]): EObject | undefined {
  if (fragment === '/') {
    return roots.length === 1 ? roots[0] : undefined;
  }
  if (fragment.startsWith('//')) {
    const rest = fragment.slice(2);
    if (roots.length !== 1) return undefined;
    // Two genuinely different kinds of fragment share this "//" prefix,
    // disambiguated by a syntactic marker: "@" starts every segment of the
    // existing positional/containment form ("@feature.index"); its absence
    // means this is instead EMF's NAME-based form for addressing metamodel
    // elements by name (e.g. "#//EClass", "#//EModelElement/eAnnotations") -
    // used throughout real .ecore files, which are themselves ordinary XMI
    // instance documents whose root happens to be an EPackage. Both forms
    // start from the same `roots` - for a name-based fragment, roots[0] is
    // the EPackage itself, and each segment is a named-child lookup (a
    // classifier within a package, or a feature within a class) rather
    // than a containment descent by feature+index.
    if (rest.startsWith('@')) {
      return walkSegments(rest, roots[0]!);
    }
    return walkNamedSegments(rest, roots[0]!);
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
 * EMF's name-based fragment form, used throughout real .ecore files:
 * "//EClass" (a top-level classifier, looked up by name within the root
 * EPackage) or "//EModelElement/eAnnotations" (a named feature within that
 * classifier). Deliberately scoped to what real Ecore.ecore itself
 * actually needs - EPackage-to-classifier and EClass-to-feature lookups,
 * both by name - not a fully general named-element path covering every
 * possible EMF model-element kind (e.g. subpackages, or addressing an
 * operation by name, are not exercised by Ecore.ecore and are not
 * supported here).
 */
function walkNamedSegments(path: string, start: EObject): EObject | undefined {
  const segments = path.split('/');
  let current: EObject | undefined = start;

  for (const name of segments) {
    if (!current) return undefined;
    const currentClass = current.eClass();
    // current is (structurally) an EPackage: look up a classifier IT
    // declares by name - via current's own "eClassifiers" feature VALUE,
    // not via a feature named "eClassifiers" found some other way.
    const eClassifiersFeature = allStructuralFeaturesOf(currentClass).filter(feature => feature.getName() === 'eClassifiers').at(0);
    if (eClassifiersFeature) {
      current = findNamedChild(current, eClassifiersFeature, name);
      continue;
    }
    // Otherwise, current is (structurally) an EClass: look up a feature IT
    // declares by name, the same way - via current's own
    // "eStructuralFeatures" feature VALUE. (Looking the name up directly
    // on currentClass itself would instead search the shared reflective
    // shape every EClass-instance has - abstract/eSuperTypes/etc - which
    // is not what a "ClassName/featureName" fragment means.)
    const eStructuralFeaturesFeature = allStructuralFeaturesOf(currentClass).filter(feature => feature.getName() === 'eStructuralFeatures').at(0);
    if (eStructuralFeaturesFeature) {
      current = findNamedChild(current, eStructuralFeaturesFeature, name);
      continue;
    }
    return undefined;
  }

  return current;
}

function findNamedChild(container: EObject, listFeature: EStructuralFeature, name: string): EObject | undefined {
  const children: EObject[] = [...(container.eGet(listFeature) as Iterable<EObject>)];
  return children.find((child: EObject) => {
    const nameFeature = allStructuralFeaturesOf(child.eClass()).filter(feature => feature.getName() === 'name').at(0);
    return nameFeature !== undefined && child.eGet(nameFeature) === name;
  });
}

function walkSegments(path: string, start: EObject): EObject | undefined {
  let current = start;
  for (const segment of path.split('/')) {
    if (!segment.startsWith('@')) return undefined;
    const dotIndex = segment.indexOf('.');
    const featureName = dotIndex === -1 ? segment.slice(1) : segment.slice(1, dotIndex);
    const feature = allStructuralFeaturesOf(current.eClass()).filter(feature => feature.getName() === featureName).at(0);
    if (!feature) return undefined;

    if (feature.isMany()) {
      const indexToken = dotIndex === -1 ? undefined : segment.slice(dotIndex + 1);
      const index = Number(indexToken);
      if (indexToken === undefined || !Number.isInteger(index)) return undefined;
      const list = [...(current.eGet(feature) as Iterable<EObject>)];
      const next = list[index];
      if (!next) return undefined;
      current = next;
    } else {
      current = current.eGet(feature) as EObject;
    }
  }
  return current;
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
