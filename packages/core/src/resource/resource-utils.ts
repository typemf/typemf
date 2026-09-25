import { EObject } from '../metamodel/api/eobject.js';
import { Resource } from './resource.js';

/**
 * Tracks which Resource a root EObject belongs to, without adding an
 * `eResource()` method to EObject itself. EMF's equivalent
 * (`InternalEObject.eResource()`) lives on an *internal* SPI interface, not
 * on the public `EObject` - matching that split here would still mean
 * `metamodel/impl` depending on `resource/`, inverting the layering we've
 * kept everywhere else (resource/ depends on metamodel/, never the other
 * way). A side-table keyed by the root object achieves the same lookup
 * without metamodel/ knowing resource/ exists at all.
 *
 * Only roots are tracked directly; a non-root object's resource is found by
 * walking eContainer() up to its root first. ResourceImpl calls
 * associateRoot/dissociateRoot as objects enter/leave getContents().
 */
const resourceByRoot = new WeakMap<EObject, Resource>();

export function associateRoot(root: EObject, resource: Resource): void {
  resourceByRoot.set(root, resource);
}

export function dissociateRoot(root: EObject): void {
  resourceByRoot.delete(root);
}

/** Which Resource `obj` belongs to, if it's part of a loaded document at all. */
export function getResourceOf(obj: EObject): Resource | undefined {
  let current = obj;
  let container = current.eContainer();
  while (container) {
    current = container;
    container = current.eContainer();
  }
  return resourceByRoot.get(current);
}
