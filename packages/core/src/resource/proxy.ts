import { EClass } from '../metamodel/types/EClass.js';
import { EObject } from '../metamodel/types/EObject.js';
import { DynamicEObjectImpl } from '../metamodel/impl/DynamicEObjectImpl.js';
import { EObjectImpl } from '../metamodel/impl/EObjectImpl.js';
import { URI } from './uri.js';

/** The URI each unresolved proxy stands for. */
const proxyURIs = new WeakMap<EObject, URI>();

/**
 * A placeholder for the object at `uri`, whose document has not been loaded: an ordinary instance
 * of `eClass` marked as a proxy (see `EObject.eIsProxy()`), whose features hold their defaults.
 * `ResourceSet.resolve()` finds the real object, and `resolveFeature()` replaces the proxy with
 * it; the proxy itself never turns into the real object.
 */
export function createProxy(eClass: EClass, uri: URI): EObject {
  const factory = eClass.getEPackage()?.getEFactoryInstance();
  let obj: EObject;
  try {
    obj = factory ? factory.create(eClass) : new DynamicEObjectImpl(eClass);
  } catch {
    // The declared type is abstract or an interface (every factory's create() rejects those) -
    // a plain dynamic shell still answers eClass()/eGet()/eIsProxy() correctly for reflective
    // code; only bean-style methods specific to a concrete generated class are unavailable until
    // this proxy actually resolves to one.
    obj = new DynamicEObjectImpl(eClass);
  }
  (obj as EObjectImpl).eSetProxy(true);
  proxyURIs.set(obj, uri);
  return obj;
}

/** The URI `obj` was created as a stand-in for, if it is still an unresolved proxy. */
export function getProxyURI(obj: EObject): URI | undefined {
  return proxyURIs.get(obj);
}
