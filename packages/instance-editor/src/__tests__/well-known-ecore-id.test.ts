import { EAttributeImpl, EcorePackageImpl, EClassImpl, EPackageImpl, createProxy, URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { wellKnownEcoreId, wellKnownEcoreObject } from '../well-known-ecore-id.js';

void EcorePackageImpl.eINSTANCE;

describe('wellKnownEcoreId / wellKnownEcoreObject', () => {
  it('assigns "ecore:<classifierID>" to Ecore\'s classifiers', () => {
    const eClass = EcorePackageImpl.eINSTANCE.getEClass();
    const id = wellKnownEcoreId(eClass);
    expect(id).toBe(`ecore:${eClass.getClassifierID()}`);
  });

  it('returns undefined for a user-defined classifier', () => {
    const userClass = new EClassImpl();
    userClass.setName('Book');
    expect(wellKnownEcoreId(userClass)).toBeUndefined();
  });

  it('returns undefined for other Ecore objects such as an EPackage', () => {
    const pkg = new EPackageImpl();
    pkg.setName('somePackage');
    expect(wellKnownEcoreId(pkg)).toBeUndefined();
  });

  it('wellKnownEcoreObject resolves the id back to the classifier', () => {
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

  it('round-trips every classifier of Ecore', () => {
    for (const classifier of EcorePackageImpl.eINSTANCE.getEClassifiers()) {
      const id = wellKnownEcoreId(classifier)!;
      expect(id).toBeDefined();
      expect(wellKnownEcoreObject(id)).toBe(classifier);
    }
  });

  it('assigns a well-known id to a feature of an Ecore classifier', () => {
    const nameFeature = EcorePackageImpl.eINSTANCE.getEPackage().getEStructuralFeature('name')!;
    const id = wellKnownEcoreId(nameFeature);
    expect(id).toBeDefined();
    expect(id).toContain('ecore-member:');
  });

  it('wellKnownEcoreObject resolves a feature id back to the feature', () => {
    const nameFeature = EcorePackageImpl.eINSTANCE.getEPackage().getEStructuralFeature('name')!;
    const id = wellKnownEcoreId(nameFeature)!;
    expect(wellKnownEcoreObject(id)).toBe(nameFeature);
  });

  it('gives an inherited feature the same id through every subclass', () => {
    const nameViaPackage = EcorePackageImpl.eINSTANCE.getEPackage().getEStructuralFeature('name')!;
    const nameViaClass = EcorePackageImpl.eINSTANCE.getEClass().getEStructuralFeature('name')!;
    expect(nameViaPackage).toBe(nameViaClass); // same, real, shared object - inherited, not duplicated
    expect(wellKnownEcoreId(nameViaPackage)).toBe(wellKnownEcoreId(nameViaClass));
  });

  it('returns undefined for a feature of a user-defined classifier', () => {
    const userClass = new EClassImpl();
    userClass.setName('Book');
    const titleAttr = new EAttributeImpl();
    titleAttr.setName('title');
    titleAttr.setEContainingClass(userClass);
    titleAttr.setFeatureID(0);
    expect(wellKnownEcoreId(titleAttr)).toBeUndefined();
  });

  it('distinguishes a feature and an operation with the same number', () => {
    // Feature IDs and operation IDs both start at 0.
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

  // An unresolved proxy reports its declared eClass but has none of a classifier's methods.
  it('gives an unresolved proxy into Ecore the id of its target', () => {
    const eString = EcorePackageImpl.eINSTANCE.getEString();
    const proxy = createProxy(
      EcorePackageImpl.eINSTANCE.getEDataType(),
      URI.parse(`${EcorePackageImpl.eINSTANCE.getNsURI()}#//EString`)
    );
    expect(proxy.eIsProxy()).toBe(true);

    expect(wellKnownEcoreId(proxy)).toBe(wellKnownEcoreId(eString));
  });

  it('gives an unresolved proxy to a feature of an Ecore classifier the id of its target', () => {
    const nameFeature = EcorePackageImpl.eINSTANCE.getEPackage().getEStructuralFeature('name')!;
    const proxy = createProxy(
      EcorePackageImpl.eINSTANCE.getEAttribute(),
      URI.parse(`${EcorePackageImpl.eINSTANCE.getNsURI()}#//EPackage/name`)
    );
    expect(wellKnownEcoreId(proxy)).toBe(wellKnownEcoreId(nameFeature));
  });

  it('returns undefined for an unresolved proxy into another document', () => {
    const proxy = createProxy(new EClassImpl(), URI.parse('https://example.com/some-other-metamodel#//SomeClass'));
    expect(() => wellKnownEcoreId(proxy)).not.toThrow();
    expect(wellKnownEcoreId(proxy)).toBeUndefined();
  });

  it('returns undefined for an unresolved proxy into Ecore with an unknown fragment', () => {
    const proxy = createProxy(
      new EClassImpl(),
      URI.parse(`${EcorePackageImpl.eINSTANCE.getNsURI()}#//NoSuchClassifier`)
    );
    expect(() => wellKnownEcoreId(proxy)).not.toThrow();
    expect(wellKnownEcoreId(proxy)).toBeUndefined();
  });
});
