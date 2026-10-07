import { EClass, EObject, EPackage, Resource } from '@typemf/core';
import { ObjectIdMap } from './object-id-map.js';

/**
 * Every object reachable from one of roots (each root itself, plus every descendant via
 * eAllContents()) whose class is targetType or one of its subtypes - isSuperTypeOf's own
 * reflexive semantics, the same, separately confirmed reasoning concreteSubtypesOf relies on for
 * the add-child picker.
 */
function typeCompatibleIds(roots: Iterable<EObject>, targetType: EClass, objectIds: ObjectIdMap): string[] {
  const candidateIds: string[] = [];
  for (const root of roots) {
    if (targetType.isSuperTypeOf(root.eClass())) candidateIds.push(objectIds.idFor(root));
    for (const obj of root.eAllContents()) {
      if (targetType.isSuperTypeOf(obj.eClass())) candidateIds.push(objectIds.idFor(obj));
    }
  }
  return candidateIds;
}

/**
 * Shared between handleReferenceCandidatesRequest (searching the current document) and
 * browseExternalReferenceCandidates (searching a picked, external file) - both needed the exact
 * same walk, just over a different resource.
 */
export function findTypeCompatibleObjects(resource: Resource, targetType: EClass, objectIds: ObjectIdMap): string[] {
  return typeCompatibleIds(resource.getContents(), targetType, objectIds);
}

/**
 * Same walk as findTypeCompatibleObjects, rooted at a registered EPackage instead of a loaded
 * Resource's contents - its classifiers (and their own declared features/operations) are
 * ordinary contained EObjects, so the same eAllContents() walk applies directly.
 */
export function findTypeCompatibleObjectsInPackage(
  pkg: EPackage,
  targetType: EClass,
  objectIds: ObjectIdMap
): string[] {
  return typeCompatibleIds([pkg], targetType, objectIds);
}
