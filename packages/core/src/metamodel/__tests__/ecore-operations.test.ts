import { describe, expect, it } from 'vitest';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
import { EClassifierImpl } from '../impl/EClassifierImpl.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { EEnumImpl } from '../impl/EEnumImpl.js';
import { EEnumLiteralImpl } from '../impl/EEnumLiteralImpl.js';
import { EGenericTypeImpl } from '../impl/EGenericTypeImpl.js';
import { EOperationImpl } from '../impl/EOperationImpl.js';
import { EParameterImpl } from '../impl/EParameterImpl.js';
import { ETypeParameterImpl } from '../impl/ETypeParameterImpl.js';
// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

describe('EEnum literal lookup', () => {
  function genre() {
    const en = new EEnumImpl();
    const sciFi = new EEnumLiteralImpl();
    sciFi.setName('SciFi');
    sciFi.setValue(1);
    sciFi.setLiteral('sci-fi');
    en.getELiterals().add(sciFi);
    return { en, sciFi };
  }

  it('getEEnumLiteral() finds a literal by name or by value', () => {
    const { en, sciFi } = genre();
    expect(en.getEEnumLiteral('SciFi')).toBe(sciFi);
    expect(en.getEEnumLiteral(1)).toBe(sciFi);
    expect(en.getEEnumLiteral('sci-fi')).toBeUndefined();
    expect(en.getEEnumLiteral(2)).toBeUndefined();
  });

  it('getEEnumLiteralByLiteral() finds a literal by its literal string', () => {
    const { en, sciFi } = genre();
    expect(en.getEEnumLiteralByLiteral('sci-fi')).toBe(sciFi);
    expect(en.getEEnumLiteralByLiteral('SciFi')).toBeUndefined();
  });
});

describe('operation overrides', () => {
  function operation(owner: EClassImpl, name: string, ...parameterTypes: EDataTypeImpl[]) {
    const op = new EOperationImpl();
    op.setName(name);
    for (const type of parameterTypes) {
      const param = new EParameterImpl();
      param.setEType(type);
      op.getEParameters().add(param);
    }
    owner.getEOperations().add(op);
    op.setEContainingClass(owner);
    return op;
  }

  function hierarchy() {
    const eString = EcorePackageImpl.eINSTANCE.getEString() as EDataTypeImpl;
    const eInt = EcorePackageImpl.eINSTANCE.getEInt() as EDataTypeImpl;
    const base = new EClassImpl();
    const leaf = new EClassImpl();
    leaf.getESuperTypes().add(base);
    const baseOp = operation(base, 'describe', eString);
    const leafOp = operation(leaf, 'describe', eString);
    const leafOverload = operation(leaf, 'describe', eInt);
    return { base, leaf, baseOp, leafOp, leafOverload };
  }

  it('isOverrideOf() is true for the same signature in a subclass only', () => {
    const { baseOp, leafOp, leafOverload } = hierarchy();
    expect(leafOp.isOverrideOf(baseOp)).toBe(true);
    expect(baseOp.isOverrideOf(leafOp)).toBe(false);
    expect(leafOp.isOverrideOf(leafOp)).toBe(false);
    expect(leafOverload.isOverrideOf(baseOp)).toBe(false);
  });

  it("getOverride() returns the subclass's overriding operation", () => {
    const { base, leaf, baseOp, leafOp } = hierarchy();
    expect(leaf.getOverride(baseOp)).toBe(leafOp);
    expect(base.getOverride(baseOp)).toBeUndefined();
  });
});

describe('EGenericType.getERawType()', () => {
  it('returns the raw type of the first bound of a type parameter', () => {
    const eString = EcorePackageImpl.eINSTANCE.getEString();
    const bound = new EGenericTypeImpl();
    bound.setEClassifier(eString);
    const param = new ETypeParameterImpl();
    param.getEBounds().add(bound);
    const gt = new EGenericTypeImpl();
    gt.setETypeParameter(param);
    expect(gt.getERawType()).toBe(eString);
  });

  it('returns the raw type of the upper bound of a wildcard', () => {
    const eString = EcorePackageImpl.eINSTANCE.getEString();
    const upper = new EGenericTypeImpl();
    upper.setEClassifier(eString);
    const wildcard = new EGenericTypeImpl();
    wildcard.setEUpperBound(upper);
    expect(wildcard.getERawType()).toBe(eString);
  });
});

describe('EStructuralFeature.getContainerClass()', () => {
  it("is the implementation class of the feature's declaring class in Ecore", () => {
    expect(EcorePackageImpl.eINSTANCE.getEClassifier_EPackage().getContainerClass()).toBe(EClassifierImpl);
  });
});
