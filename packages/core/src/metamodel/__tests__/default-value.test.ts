import { describe, expect, it } from 'vitest';
import {
  EAttributeImpl,
  EClassImpl,
  EcorePackageImpl,
  EEnumImpl,
  EEnumLiteralImpl,
  EReferenceImpl,
} from '../../index.js';

const ecore = EcorePackageImpl.eINSTANCE;

function attribute(type: ReturnType<typeof ecore.getEInt>, literal?: string, upperBound = 1): EAttributeImpl {
  const attr = new EAttributeImpl();
  attr.setName('a');
  attr.setEType(type);
  attr.setUpperBound(upperBound);
  if (literal !== undefined) attr.setDefaultValueLiteral(literal);
  return attr;
}

describe('EClassifier.getDefaultValue()', () => {
  it('is false for EBoolean, 0n for ELong and 0 for the other numeric primitive data types', () => {
    expect(ecore.getEBoolean().getDefaultValue()).toBe(false);
    expect(ecore.getELong().getDefaultValue()).toBe(0n);
    for (const type of [ecore.getEInt(), ecore.getEFloat(), ecore.getEDouble(), ecore.getEShort(), ecore.getEByte()]) {
      expect(type.getDefaultValue()).toBe(0);
    }
  });

  it("is an enum's first literal", () => {
    const color = new EEnumImpl();
    for (const name of ['red', 'green']) {
      const literal = new EEnumLiteralImpl();
      literal.setName(name);
      color.getELiterals().add(literal);
    }
    expect(color.getDefaultValue()).toBe('red');
  });

  it('is undefined for other data types and for classes', () => {
    expect(ecore.getEString().getDefaultValue()).toBeUndefined();
    expect(ecore.getEIntegerObject().getDefaultValue()).toBeUndefined();
    expect(ecore.getEClass().getDefaultValue()).toBeUndefined();
  });
});

describe('EStructuralFeature.getDefaultValue()', () => {
  it("is the type's default value without a defaultValueLiteral", () => {
    expect(attribute(ecore.getEInt()).getDefaultValue()).toBe(0);
    expect(attribute(ecore.getEString()).getDefaultValue()).toBeUndefined();
  });

  it('is the defaultValueLiteral converted to the type', () => {
    expect(attribute(ecore.getEBoolean(), 'true').getDefaultValue()).toBe(true);
    expect(attribute(ecore.getEInt(), '42').getDefaultValue()).toBe(42);
    expect(attribute(ecore.getEString(), 'none').getDefaultValue()).toBe('none');
  });

  it('follows a change of the defaultValueLiteral', () => {
    const attr = attribute(ecore.getEInt(), '1');
    expect(attr.getDefaultValue()).toBe(1);
    attr.setDefaultValueLiteral('2');
    expect(attr.getDefaultValue()).toBe(2);
  });

  it('is undefined for a many-valued feature and for a reference', () => {
    expect(attribute(ecore.getEInt(), '1', -1).getDefaultValue()).toBeUndefined();
    const ref = new EReferenceImpl();
    ref.setEType(new EClassImpl());
    expect(ref.getDefaultValue()).toBeUndefined();
  });

  it("matches Ecore's own declared defaults", () => {
    expect(ecore.getEStructuralFeature_Changeable().getDefaultValue()).toBe(true);
    expect(ecore.getETypedElement_UpperBound().getDefaultValue()).toBe(1);
    expect(ecore.getEClass_Abstract().getDefaultValue()).toBe(false);
  });
});
