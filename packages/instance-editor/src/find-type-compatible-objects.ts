import { EClass, Resource } from '@typemf/core';
import { ObjectIdMap } from './object-id-map.js';

/**
 * Every object in resource's own containment tree (its own top-level roots plus every
 * descendant, via eAllContents()) whose class is targetType or one of its subtypes -
 * isSuperTypeOf's own reflexive semantics, the same, separately confirmed reasoning
 * concreteSubtypesOf relies on for the add-child picker. Shared between
 * handleReferenceCandidatesRequest (searching the current document) and
 * browseExternalReferenceCandidates (searching a picked, external file) - both needed the exact
 * same walk, just over a different resource.
 */
export function findTypeCompatibleObjects(resource: Resource, targetType: EClass, objectIds: ObjectIdMap): string[] {
  const candidateIds: string[] = [];
  for (const root of resource.getContents()) {
    if (targetType.isSuperTypeOf(root.eClass())) candidateIds.push(objectIds.idFor(root));
    for (const obj of root.eAllContents()) {
      if (targetType.isSuperTypeOf(obj.eClass())) candidateIds.push(objectIds.idFor(obj));
    }
  }
  return candidateIds;
}
