import { EObjectImpl } from '../metamodel/impl/EObjectImpl.js';
import { EObject } from '../metamodel/types/EObject.js';
import { Resource } from './resource.js';

/** @internal Records `resource` as the resource of the root object `root`; used by a resource's contents list. */
export function associateRoot(root: EObject, resource: Resource): void {
  (root as EObjectImpl).eSetDirectResource(resource);
}

/** @internal Clears the resource recorded for `root`; used by a resource's contents list. */
export function dissociateRoot(root: EObject): void {
  (root as EObjectImpl).eSetDirectResource(undefined);
}

/** Which Resource `obj` belongs to, if it's part of a loaded document at all. */
export function getResourceOf(obj: EObject): Resource | undefined {
  return obj.eResource();
}
