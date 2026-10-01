import { EAttributeImpl, EcorePackageImpl, EClass, EClassImpl, EPackageImpl, ProxyEObjectImpl, URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { wellKnownEcoreId, wellKnownEcoreObject } from '../well-known-ecore-id.js';

void EcorePackageImpl.eINSTANCE;

describe('wellKnownEcoreId / wellKnownEcoreObject', () => {
  it('assigns a well-known id to one of Ecore\'s own classifiers, in the "ecore:<classifierID>" format', () => {
    const eClass = EcorePackageImpl.eINSTANCE.getEClass();
    const id = wellKnownEcoreId(eClass);
    expect(id).toBe(`ecore:${eClass.getClassifierID()}`);
  });

  it('returns undefined for a user-defined classifier, even though it is an instance of EClass', () => {
    const userClass = new EClassImpl();
    userClass.setName('Book');
    expect(wellKnownEcoreId(userClass)).toBeUndefined();
  });

  it('returns undefined for a non-classifier EObject, even one of Ecore\'s own (e.g. an EPackage instance)', () => {
    const pkg = new EPackageImpl();
    pkg.setName('somePackage');
    expect(wellKnownEcoreId(pkg)).toBeUndefined();
  });

  it('wellKnownEcoreObject resolves a well-known id back to the exact real, local classifier', () => {
    const eAttribute = EcorePackageImpl.eINSTANCE.getEAttribute();
    const id = wellKnownEcoreId(eAttribute)!;
    expect(wellKnownEcoreObject(id)).toBe(eAttribute);
  });

  it('wellKnownEcoreObject returns undefined for an ordinary opaque id (no "ecore:" prefix)', () => {
    expect(wellKnownEcoreObject('42')).toBeUndefined();
  });

  it('wellKnownEcoreObject returns undefined for a malformed or unknown "ecore:" id', () => {
    expect(wellKnownEcoreObject('ecore:not-a-number')).toBeUndefined();
    expect(wellKnownEcoreObject('ecore:999999')).toBeUndefined();
  });

  it('every one of Ecore\'s own classifiers round-trips through id -> object correctly', () => {
    for (const classifier of EcorePackageImpl.eINSTANCE.getEClassifiers()) {
      const id = wellKnownEcoreId(classifier)!;
      expect(id).toBeDefined();
      expect(wellKnownEcoreObject(id)).toBe(classifier);
    }
  });

  // The real, reported bug this covers: a well-known classifier's OWN features/operations (e.g.
  // ENamedElement.name, read directly off EPackage/EClass/... - shared by every named Ecore
  // metaclass) never went through SnapshotSerializer.deserialize() at all, so they were never
  // registered, and a real edit to anything's own "name" could never be relayed to the host.
  it('assigns a well-known id to a feature declared on one of Ecore\'s own classifiers (e.g. ENamedElement.name via EPackage)', () => {
    const nameFeature = EcorePackageImpl.eINSTANCE.getEPackage().getEStructuralFeature('name')!;
    const id = wellKnownEcoreId(nameFeature);
    expect(id).toBeDefined();
    expect(id).toContain('ecore-member:');
  });

  it('wellKnownEcoreObject resolves a well-known feature id back to the exact real, local feature object', () => {
    const nameFeature = EcorePackageImpl.eINSTANCE.getEPackage().getEStructuralFeature('name')!;
    const id = wellKnownEcoreId(nameFeature)!;
    expect(wellKnownEcoreObject(id)).toBe(nameFeature);
  });

  it('the SAME well-known feature looked up via two different subclasses (e.g. EPackage vs EClass, both inheriting ENamedElement.name) yields the same id', () => {
    const nameViaPackage = EcorePackageImpl.eINSTANCE.getEPackage().getEStructuralFeature('name')!;
    const nameViaClass = EcorePackageImpl.eINSTANCE.getEClass().getEStructuralFeature('name')!;
    expect(nameViaPackage).toBe(nameViaClass); // same, real, shared object - inherited, not duplicated
    expect(wellKnownEcoreId(nameViaPackage)).toBe(wellKnownEcoreId(nameViaClass));
  });

  it('returns undefined for a feature declared on a user-defined classifier, not one of Ecore\'s own', () => {
    const userClass = new EClassImpl();
    userClass.setName('Book');
    const titleAttr = new EAttributeImpl();
    titleAttr.setName('title');
    titleAttr.setEContainingClass(userClass);
    titleAttr.setFeatureID(0);
    expect(wellKnownEcoreId(titleAttr)).toBeUndefined();
  });

  it('a feature and an operation with the SAME own id on the same class resolve to different objects, not a collision', () => {
    // EClass has both features (featureID 0, 1, 2, ...) and operations (operationID 0, 1, 2, ...)
    // - two entirely separate numbering spaces sharing the same small integers, the real risk a
    // bare numeric id (without a kind marker) would collide on.
    const eClass = EcorePackageImpl.eINSTANCE.getEClass();
    const firstFeature = [...eClass.getEAllStructuralFeatures()][0]!;
    const firstOperation = [...eClass.getEAllOperations()][0]!;
    expect(firstFeature).not.toBe(firstOperation as unknown);

    const featureId = wellKnownEcoreId(firstFeature)!;
    const operationId = wellKnownEcoreId(firstOperation as unknown as Parameters<typeof wellKnownEcoreId>[0])!;
    expect(featureId).not.toBe(operationId);
    expect(wellKnownEcoreObject(featureId)).toBe(firstFeature);
    expect(wellKnownEcoreObject(operationId)).toBe(firstOperation);
  });

  // The real, confirmed crash this covers: a still-unresolved proxy can genuinely be
  // isEClassifier(obj)===true (it only inspects the proxy's own DECLARED eClass), but it
  // implements none of a real classifier's actual methods (getEPackage(), etc.) - reachable once
  // a same-attribute cross-document reference (e.g. eType="ecore:EDataType http://.../Ecore#//
  // EString") flows through here unresolved, since resolving THAT proxy is deliberately lazy.
  it('a still-unresolved proxy pointing into Ecore\'s own metamodel resolves to the SAME well-known id its real, resolved target would have - without ever crashing', () => {
    const eString = EcorePackageImpl.eINSTANCE.getEString();
    const proxy = new ProxyEObjectImpl(EcorePackageImpl.eINSTANCE.getEDataType(), URI.parse(`${EcorePackageImpl.eINSTANCE.getNsURI()}#//EString`));
    expect(proxy.eIsProxy()).toBe(true);

    expect(wellKnownEcoreId(proxy)).toBe(wellKnownEcoreId(eString));
  });

  it('a still-unresolved proxy pointing at a member (feature) of one of Ecore\'s own classifiers also resolves correctly, unresolved', () => {
    const nameFeature = EcorePackageImpl.eINSTANCE.getEPackage().getEStructuralFeature('name')!;
    const proxy = new ProxyEObjectImpl(
      EcorePackageImpl.eINSTANCE.getEAttribute(),
      URI.parse(`${EcorePackageImpl.eINSTANCE.getNsURI()}#//EPackage/name`)
    );
    expect(wellKnownEcoreId(proxy)).toBe(wellKnownEcoreId(nameFeature));
  });

  it('a still-unresolved proxy pointing at a DIFFERENT document entirely returns undefined, safely - not a crash', () => {
    const proxy = new ProxyEObjectImpl(new EClassImpl(), URI.parse('https://example.com/some-other-metamodel#//SomeClass'));
    expect(() => wellKnownEcoreId(proxy)).not.toThrow();
    expect(wellKnownEcoreId(proxy)).toBeUndefined();
  });

  it('a still-unresolved proxy into Ecore\'s own metamodel but with an unresolvable fragment returns undefined, safely', () => {
    const proxy = new ProxyEObjectImpl(new EClassImpl(), URI.parse(`${EcorePackageImpl.eINSTANCE.getNsURI()}#//NoSuchClassifier`));
    expect(() => wellKnownEcoreId(proxy)).not.toThrow();
    expect(wellKnownEcoreId(proxy)).toBeUndefined();
  });
});
