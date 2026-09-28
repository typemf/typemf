import { EClass } from '../metamodel/types/EClass.js';
import { EList } from '../metamodel/types/EList.js';
import { EObject } from '../metamodel/types/EObject.js';
import { EStructuralFeature } from '../metamodel/types/EStructuralFeature.js';
import { BasicEList } from '../metamodel/impl/BasicEList.js';
import { EObjectImpl } from '../metamodel/impl/EObjectImpl.js';
import { URI } from './uri.js';

/**
 * A stand-in for "I know this is an instance of `eClass`, identified by
 * `proxyURI`, but haven't loaded the document it actually lives in yet."
 * Produced by an EObjectSerializer when it encounters a cross-resource
 * reference it can't resolve inline; resolved via ResourceSet.resolve().
 *
 * Lives in resource/, not metamodel/, deliberately: proxies are a
 * persistence-layer concept (they only make sense once URIs/documents
 * exist), and metamodel/ should stay resource-agnostic - see the layering
 * note in resource-utils.ts for the matching decision on the *other* side
 * of this relationship (Resource does not make EObject aware of it either).
 */
export class ProxyEObjectImpl extends EObjectImpl {
  constructor(
    private readonly proxyEClass: EClass,
    private readonly proxyURI: URI
  ) {
    super();
  }

  eClass(): EClass {
    return this.proxyEClass;
  }

  override eIsProxy(): boolean {
    return true;
  }

  getProxyURI(): URI {
    return this.proxyURI;
  }

  override eContents(): EList<EObject> {
    // A proxy has no known content until resolved.
    return new BasicEList<EObject>();
  }

  override eAllContents(): EObject[] {
    return [];
  }

  override fullId(): string {
    return `Proxy(${this.proxyEClass.getName()}, ${this.proxyURI.toString()})`;
  }

  eGet(_feature: EStructuralFeature): never {
    throw new Error(
      `Cannot read a feature of an unresolved proxy (${this.fullId()}) - resolve it via ResourceSet.resolve() first.`
    );
  }

  eSet(_feature: EStructuralFeature, _value: unknown): never {
    throw new Error(
      `Cannot set a feature of an unresolved proxy (${this.fullId()}) - resolve it via ResourceSet.resolve() first.`
    );
  }

  eBasicSetValue(_feature: EStructuralFeature, _value: unknown): never {
    throw new Error(
      `Cannot set a feature of an unresolved proxy (${this.fullId()}) - resolve it via ResourceSet.resolve() first.`
    );
  }

  eIsSet(_feature: EStructuralFeature): never {
    throw new Error(
      `Cannot check a feature of an unresolved proxy (${this.fullId()}) - resolve it via ResourceSet.resolve() first.`
    );
  }

  eUnset(_feature: EStructuralFeature): never {
    throw new Error(
      `Cannot unset a feature of an unresolved proxy (${this.fullId()}) - resolve it via ResourceSet.resolve() first.`
    );
  }
}
