import { EClass } from '../metamodel/types/EClass.js';
import { EObject } from '../metamodel/types/EObject.js';
import { DynamicEObjectImpl } from '../metamodel/impl/DynamicEObjectImpl.js';
import { EObjectImpl } from '../metamodel/impl/EObjectImpl.js';
import { URI } from './uri.js';

/** Which URI each currently-unresolved proxy stands in for. Not a field on EObjectImpl itself -
 *  unlike eResource()'s Resource (CORE-08, a type-only reference with no runtime footprint in
 *  metamodel/), a URI is a real value a proxy needs to carry around, and metamodel/ has no
 *  business constructing or storing one of those itself. */
const proxyURIs = new WeakMap<EObject, URI>();

/**
 * Creates a stand-in for "I know this is an instance of `eClass`, identified by `uri`, but
 * haven't loaded the document it actually lives in yet." A real instance of `eClass` - created
 * through its own package's factory, the same way any other instance of it would be - flagged as
 * a proxy (see EObjectImpl.eSetProxy) rather than represented by a separate class. Every ordinary
 * feature read returns that class's own, normal default until resolved, instead of throwing.
 *
 * Resolved via ResourceSet.resolve()/resolveFeature(), which locate the real object and swap it
 * into whichever feature referenced this proxy - this object itself is never mutated into "the
 * real one"; once resolved, nothing references it anymore and it is simply discarded.
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
