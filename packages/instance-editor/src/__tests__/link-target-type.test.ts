import { EcoreFactoryImpl, EcorePackageImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { linkTargetType } from '../link-target-type.js';

const ecore = EcorePackageImpl.eINSTANCE;
const factory = new EcoreFactoryImpl();
const eType = ecore.getETypedElement_EType();
const eClassifier = ecore.getEClassifier();

describe('linkTargetType', () => {
  it('narrows the eType of an attribute to data types', () => {
    expect(linkTargetType(factory.createEAttribute(), eType, eClassifier)).toBe(ecore.getEDataType());
  });

  it('narrows the eType of a reference to classes', () => {
    expect(linkTargetType(factory.createEReference(), eType, eClassifier)).toBe(ecore.getEClass());
  });

  it('keeps the declared type of an operation eType', () => {
    expect(linkTargetType(factory.createEOperation(), eType, eClassifier)).toBe(eClassifier);
  });

  it('keeps the declared type of any other feature', () => {
    const eSuperTypes = ecore.getEClass_ESuperTypes();
    expect(linkTargetType(factory.createEClass(), eSuperTypes, ecore.getEClass())).toBe(ecore.getEClass());
  });
});
