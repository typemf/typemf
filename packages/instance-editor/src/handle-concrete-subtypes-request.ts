import { EClass, ResourceSet } from '@typemf/core';
import { concreteSubtypesOf } from './instantiable-classes.js';
import { ConcreteSubtypesError, ConcreteSubtypesRequest, ConcreteSubtypesResponse } from './host-message-protocol.js';
import { ObjectIdMap } from './object-id-map.js';

/**
 * Finds every concrete class request.classId (or one of its subtypes) that this document's own
 * registry actually knows about - document.resourceSet.getPackageRegistry(), not the shared
 * runtime.packageRegistry: a dynamic-mode document may have a package resolved locally (via the
 * missing-package QuickPick flow) that was never added to the shared registry at all, and this
 * needs to see whatever THIS document genuinely has available, matching the same static/dynamic
 * parity this whole editor was built around.
 *
 * Same `{ objectIds }` narrowing as the other two handlers, for the same reason - plus
 * `resourceSet` here too, since this one genuinely needs the document's own registry, not just
 * its id map.
 */
export function handleConcreteSubtypesRequest(
  request: ConcreteSubtypesRequest,
  document: { objectIds: ObjectIdMap; resourceSet: ResourceSet }
): ConcreteSubtypesResponse | ConcreteSubtypesError {
  const superType = document.objectIds.objectFor(request.classId) as EClass | undefined;
  if (!superType) {
    return {
      type: 'typemf/concreteSubtypesError',
      requestId: request.requestId,
      message: `No class known for id '${request.classId}'.`,
    };
  }

  const packages = document.resourceSet.getPackageRegistry().getAllPackages();
  const classIds = concreteSubtypesOf(superType, packages).map((eClass) => document.objectIds.idFor(eClass));
  return { type: 'typemf/concreteSubtypesResult', requestId: request.requestId, classIds };
}
