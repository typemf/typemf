import { EClass, Resource } from '@typemf/core';
import { findTypeCompatibleObjects } from './find-type-compatible-objects.js';
import { ReferenceCandidatesError, ReferenceCandidatesRequest, ReferenceCandidatesResponse } from './host-message-protocol.js';
import { ObjectIdMap } from './object-id-map.js';

/**
 * Every object in document.resource's own containment tree (its own top-level roots plus every
 * descendant, via eAllContents()) whose class is request.typeId or one of its subtypes -
 * isSuperTypeOf's own reflexive semantics, same as concreteSubtypesOf's own, separately confirmed
 * reasoning. Scoped to this one document's own resource, not the whole resourceSet (which could
 * also hold unrelated, separately-loaded metamodel resources) - "pick an existing object to point
 * at" means an object genuinely in THIS document, not anywhere @typemf/core happens to have
 * loaded something. Same `{ objectIds }` narrowing as the other handlers, plus `resource` here
 * too, since this one genuinely needs the document's own contents to search.
 */
export function handleReferenceCandidatesRequest(
  request: ReferenceCandidatesRequest,
  document: { objectIds: ObjectIdMap; resource: Resource }
): ReferenceCandidatesResponse | ReferenceCandidatesError {
  const targetType = document.objectIds.objectFor(request.typeId) as EClass | undefined;
  if (!targetType) {
    return { type: 'typemf/referenceCandidatesError', requestId: request.requestId, message: `No class known for id '${request.typeId}'.` };
  }

  const candidateIds = findTypeCompatibleObjects(document.resource, targetType, document.objectIds);
  return { type: 'typemf/referenceCandidatesResult', requestId: request.requestId, candidateIds };
}
