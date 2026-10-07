import { EObjectImpl } from '../metamodel/impl/EObjectImpl.js';
import { EObject } from '../metamodel/types/EObject.js';
import { Resource } from './resource.js';

/**
 * Thin wrappers over EObject.eResource()/EObjectImpl.eSetDirectResource() - real EMF's own public
 * API, not a side table kept outside the metamodel: `eSetDirectResource` is internal
 * (same as `eBasicSetContainer`/`eSetProxy`), so these are the forms callers outside this file
 * actually use. `associateRoot`/`dissociateRoot` are called by Resource's own contents list
 * (resource-impl.ts) as an object enters/leaves getContents(); `getResourceOf` is a free-function
 * convenience for the same `eResource()` call.
 */
export function associateRoot(root: EObject, resource: Resource): void {
  (root as EObjectImpl).eSetDirectResource(resource);
}

export function dissociateRoot(root: EObject): void {
  (root as EObjectImpl).eSetDirectResource(undefined);
}

/** Which Resource `obj` belongs to, if it's part of a loaded document at all. */
export function getResourceOf(obj: EObject): Resource | undefined {
  return obj.eResource();
}
