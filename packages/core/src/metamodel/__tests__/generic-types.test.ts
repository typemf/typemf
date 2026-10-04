import { describe, expect, it } from 'vitest';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { EGenericTypeImpl } from '../impl/EGenericTypeImpl.js';
import { ETypeParameterImpl } from '../impl/ETypeParameterImpl.js';
import { EObject } from '../types/EObject.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

function feature(owner: EObject, name: string): EStructuralFeature {
  const found = owner.eClass().getEStructuralFeature(name);
  if (!found) throw new Error(`No real feature named '${name}' on ${owner.eClass().getName()}.`);
  return found;
}

function genericClassifier() {
  const javaClass = new EDataTypeImpl();
  javaClass.setName('EJavaClass');
  const t = new ETypeParameterImpl();
  t.setName('T');
  javaClass.getETypeParameters().add(t);
  return { javaClass, t };
}

describe('type parameters and generic types', () => {
  it('a classifier has no type parameters by default', () => {
    expect(new EDataTypeImpl().getETypeParameters().size()).toBe(0);
    const { javaClass, t } = genericClassifier();
    expect(javaClass.getETypeParameters().size()).toBe(1);
    expect(javaClass.getETypeParameters().get(0)).toBe(t);
    expect(t.getName()).toBe('T');
  });

  it('an EGenericType holds a classifier and type arguments', () => {
    const { javaClass } = genericClassifier();
    const bound = new EDataTypeImpl();
    bound.setName('EString');
    const arg = new EGenericTypeImpl();
    arg.setEClassifier(bound);
    const unbound = new EGenericTypeImpl();
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(javaClass);
    gt.getETypeArguments().add(arg);
    gt.getETypeArguments().add(unbound);
    expect(gt.getETypeArguments().get(0).getEClassifier()).toBe(bound);
    expect(gt.getETypeArguments().get(1).getEClassifier()).toBeUndefined();
    expect(gt.getETypeArguments().get(1).getETypeParameter()).toBeUndefined();
  });

  it("setEGenericType() sets eType to the generic type's classifier", () => {
    const { javaClass } = genericClassifier();
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(javaClass);
    const attr = new EAttributeImpl();
    attr.setEGenericType(gt);
    expect(attr.getEGenericType()).toBe(gt);
    expect(attr.getEType()).toBe(javaClass);
  });

  it('getERawType() returns the classifier', () => {
    const { javaClass } = genericClassifier();
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(javaClass);
    expect(gt.getERawType()).toBe(javaClass);
  });

  it('getERawType() returns EJavaObject for an unbounded type parameter', () => {
    const param = new ETypeParameterImpl();
    param.setName('T');
    const gt = new EGenericTypeImpl();
    gt.setETypeParameter(param);
    expect(gt.getERawType()?.getName()).toBe('EJavaObject');
  });

  it('setEGenericType() with an unbounded type parameter sets eType to EJavaObject', () => {
    const param = new ETypeParameterImpl();
    param.setName('T');
    const gt = new EGenericTypeImpl();
    gt.setETypeParameter(param);
    const attr = new EAttributeImpl();
    attr.setEGenericType(gt);
    expect(attr.getEGenericType()).toBe(gt);
    expect(attr.getEType()?.getName()).toBe('EJavaObject');
  });

  it('setEType() clears the generic type', () => {
    const { javaClass } = genericClassifier();
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(javaClass);
    const attr = new EAttributeImpl();
    attr.setEGenericType(gt);
    const other = new EDataTypeImpl();
    attr.setEType(other);
    expect(attr.getEType()).toBe(other);
    expect(attr.getEGenericType()).toBeUndefined();
  });

  it('eTypeParameters, eGenericType and the EGenericType features are reachable reflectively', () => {
    const { javaClass, t } = genericClassifier();
    expect(javaClass.eGet(feature(javaClass, 'eTypeParameters'))).toBe(javaClass.getETypeParameters());
    expect(javaClass.eIsSet(feature(javaClass, 'eTypeParameters'))).toBe(true);
    javaClass.eUnset(feature(javaClass, 'eTypeParameters'));
    expect(javaClass.getETypeParameters().size()).toBe(0);
    javaClass.eSet(feature(javaClass, 'eTypeParameters'), [t]);
    expect(javaClass.getETypeParameters().get(0)).toBe(t);

    const gt = new EGenericTypeImpl();
    const attr = new EAttributeImpl();
    attr.eSet(feature(attr, 'eGenericType'), gt);
    expect(attr.eGet(feature(attr, 'eGenericType'))).toBe(gt);
    expect(attr.eIsSet(feature(attr, 'eGenericType'))).toBe(true);
    attr.eUnset(feature(attr, 'eGenericType'));
    expect(attr.getEGenericType()).toBeUndefined();

    gt.eSet(feature(gt, 'eClassifier'), javaClass);
    expect(gt.eGet(feature(gt, 'eClassifier'))).toBe(javaClass);
    gt.eSet(feature(gt, 'eTypeParameter'), t);
    expect(gt.eGet(feature(gt, 'eTypeParameter'))).toBe(t);
    expect(gt.eIsSet(feature(gt, 'eTypeArguments'))).toBe(false);
  });
});

describe('EClass.eGenericSuperTypes', () => {
  it('is empty by default and reachable reflectively', () => {
    const c = new EClassImpl();
    expect(c.getEGenericSuperTypes().size()).toBe(0);
    const gt = new EGenericTypeImpl();
    c.getEGenericSuperTypes().add(gt);
    expect(c.getEGenericSuperTypes().get(0)).toBe(gt);

    const f = feature(c, 'eGenericSuperTypes');
    expect(c.eGet(f)).toBe(c.getEGenericSuperTypes());
    expect(c.eIsSet(f)).toBe(true);
    c.eUnset(f);
    expect(c.getEGenericSuperTypes().size()).toBe(0);
    c.eSet(f, [gt]);
    expect(c.getEGenericSuperTypes().get(0)).toBe(gt);
  });

  it('is independent of eSuperTypes', () => {
    const c = new EClassImpl();
    const base = new EClassImpl();
    c.getESuperTypes().add(base);
    c.getEGenericSuperTypes().add(new EGenericTypeImpl());
    expect(c.getESuperTypes().size()).toBe(1);
    expect(c.getEGenericSuperTypes().size()).toBe(1);
  });
});
