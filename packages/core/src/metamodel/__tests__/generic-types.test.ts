import { describe, expect, it } from 'vitest';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { EGenericTypeImpl } from '../impl/EGenericTypeImpl.js';
import { ETypeParameterImpl } from '../impl/ETypeParameterImpl.js';
import { EObject } from '../types/EObject.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
// See NOTES.md's point 6 write-up: every generated setter routes through getEcorePackageRef(), which
// needs Ecore's own metaclass system bootstrapped first - this triggers that safely before any test
// in this file constructs a raw metaclass instance.
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
  it('a classifier declares type parameters; none by default', () => {
    expect(new EDataTypeImpl().getETypeParameters().size()).toBe(0);
    const { javaClass, t } = genericClassifier();
    expect(javaClass.getETypeParameters().size()).toBe(1);
    expect(javaClass.getETypeParameters().get(0)).toBe(t);
    expect(t.getName()).toBe('T');
  });

  it('an EGenericType holds a classifier and positional type arguments (an empty argument is "unbound")', () => {
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

  it('setEGenericType() keeps eType in sync (eType becomes the generic type\'s classifier)', () => {
    const { javaClass } = genericClassifier();
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(javaClass);
    const attr = new EAttributeImpl();
    attr.setEGenericType(gt);
    expect(attr.getEGenericType()).toBe(gt);
    expect(attr.getEType()).toBe(javaClass);
  });

  it("getERawType(): a real eClassifier IS the raw type - real EMF's own erasure semantics", () => {
    const { javaClass } = genericClassifier();
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(javaClass);
    expect(gt.getERawType()).toBe(javaClass);
  });

  it("getERawType(): an eTypeParameter with no eClassifier and no bounds falls back to EJavaObject - real EMF's own erasure semantics for an unbounded type parameter (post-swap: the generated EGenericTypeImpl supports this fully, unlike hand-written core's old, simplified stand-in, which had no bounds modeled at all and returned undefined here)", () => {
    const param = new ETypeParameterImpl();
    param.setName('T');
    const gt = new EGenericTypeImpl();
    gt.setETypeParameter(param);
    expect(gt.getERawType()?.getName()).toBe('EJavaObject');
  });

  it("getERawType() feeds setEGenericType()'s eType side effect - so the EJavaObject fallback shows up there too", () => {
    const param = new ETypeParameterImpl();
    param.setName('T');
    const gt = new EGenericTypeImpl();
    gt.setETypeParameter(param);
    const attr = new EAttributeImpl();
    attr.setEGenericType(gt);
    expect(attr.getEGenericType()).toBe(gt);
    expect(attr.getEType()?.getName()).toBe('EJavaObject'); // matches getERawType()'s own fallback
  });

  it('setEType() replaces any generic type, so the two can never disagree', () => {
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

  it('is reachable reflectively: eTypeParameters on a classifier, eGenericType on a typed element, and EGenericType\'s own features', () => {
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

describe('EClass.eGenericSuperTypes (a direct generic supertype edge - separate from eSuperTypes)', () => {
  it('is live, empty by default, and reachable reflectively - mirroring eSuperTypes exactly', () => {
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

  it('does not affect, and is not affected by, plain eSuperTypes', () => {
    const c = new EClassImpl();
    const base = new EClassImpl();
    c.getESuperTypes().add(base);
    c.getEGenericSuperTypes().add(new EGenericTypeImpl());
    expect(c.getESuperTypes().size()).toBe(1);
    expect(c.getEGenericSuperTypes().size()).toBe(1);
  });
});
