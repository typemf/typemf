import { describe, expect, it } from 'vitest';
import { EAnnotationImpl } from '../impl/EAnnotationImpl.js';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { createInstanceOf } from '../impl/metamodel-helpers.js';
import { DynamicEFactoryImpl } from '../impl/DynamicEFactoryImpl.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { EEnumImpl } from '../impl/EEnumImpl.js';
import { EEnumLiteralImpl } from '../impl/EEnumLiteralImpl.js';
import { EOperationImpl } from '../impl/EOperationImpl.js';
import { EPackageImpl } from '../impl/EPackageImpl.js';
import { EParameterImpl } from '../impl/EParameterImpl.js';
import { EReferenceImpl } from '../impl/EReferenceImpl.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
import { EObject } from '../types/EObject.js';
// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

function feature(owner: EObject, name: string): EStructuralFeature {
  const found = owner.eClass().getEStructuralFeature(name);
  if (!found) throw new Error(`No feature named '${name}' on ${owner.eClass().getName()}.`);
  return found;
}

describe('reflective eGet/eSet - inherited features', () => {
  it('EAttribute reaches eAnnotations from EModelElement', () => {
    const attr = new EAttributeImpl();
    attr.setName('title');
    const annotation = new EAnnotationImpl();
    annotation.setSource('http://example.com');
    attr.getEAnnotations().add(annotation);

    const result = attr.eGet(feature(attr, 'eAnnotations'));
    expect(result).toBe(attr.getEAnnotations());
  });

  it('EEnum reaches name from ENamedElement and its own eLiterals', () => {
    const en = new EEnumImpl();
    en.setName('Genre');
    expect(en.eGet(feature(en, 'name'))).toBe('Genre');
    expect(en.eGet(feature(en, 'eLiterals'))).toBe(en.getELiterals());
  });

  it('eGet throws for a feature the class does not have', () => {
    const attr = new EAttributeImpl();
    const bogus = new EAttributeImpl();
    bogus.setName('bogus');
    (bogus as unknown as { setFeatureID(id: number): void }).setFeatureID(9999);
    expect(() => attr.eGet(bogus)).toThrow(/The feature 'bogus' is not a valid feature/);
  });
});

describe('reflective eGet/eSet - own features', () => {
  it('EClassImpl: abstract, eSuperTypes, eStructuralFeatures', () => {
    const base = new EClassImpl();
    base.setName('Base');
    const sub = new EClassImpl();
    sub.setName('Sub');
    const attr = new EAttributeImpl();
    attr.setName('x');

    sub.eSet(feature(sub, 'abstract'), true);
    expect(sub.eGet(feature(sub, 'abstract'))).toBe(true);
    expect(sub.isAbstract()).toBe(true);

    sub.eSet(feature(sub, 'eSuperTypes'), [base]);
    expect(sub.eGet(feature(sub, 'eSuperTypes'))).toBe(sub.getESuperTypes());
    expect(sub.getESuperTypes().toArray()).toEqual([base]);

    sub.eSet(feature(sub, 'eStructuralFeatures'), [attr]);
    expect(sub.getEStructuralFeatures().toArray()).toEqual([attr]);
  });

  it('EPackageImpl: nsURI, nsPrefix, eClassifiers', () => {
    const pkg = new EPackageImpl();
    pkg.eSet(feature(pkg, 'nsURI'), 'https://example.com');
    pkg.eSet(feature(pkg, 'nsPrefix'), 'ex');
    expect(pkg.eGet(feature(pkg, 'nsURI'))).toBe('https://example.com');
    expect(pkg.eGet(feature(pkg, 'nsPrefix'))).toBe('ex');

    const dt = new EDataTypeImpl();
    dt.setName('EString');
    pkg.eSet(feature(pkg, 'eClassifiers'), [dt]);
    expect(pkg.getEClassifiers().toArray()).toEqual([dt]);
  });

  it('EReferenceImpl: containment, eOpposite and the derived container', () => {
    const a = new EReferenceImpl();
    a.setName('a');
    const b = new EReferenceImpl();
    b.setName('b');
    a.eSet(feature(a, 'containment'), true);
    a.eSet(feature(a, 'eOpposite'), b);
    b.eSet(feature(b, 'eOpposite'), a);

    expect(a.eGet(feature(a, 'containment'))).toBe(true);
    expect(a.eGet(feature(a, 'eOpposite'))).toBe(b);
    // container is true when the opposite is a containment.
    expect(b.eGet(feature(b, 'container'))).toBe(true);
    expect(a.eGet(feature(a, 'container'))).toBe(false);
  });

  it('EEnumLiteralImpl: literal is unset while getLiteral() falls back to the name', () => {
    const lit = new EEnumLiteralImpl();
    lit.setName('SciFi');
    expect(lit.eIsSet(feature(lit, 'literal'))).toBe(false);
    expect(lit.getLiteral()).toBe('SciFi');

    lit.eSet(feature(lit, 'literal'), 'Science Fiction');
    expect(lit.eIsSet(feature(lit, 'literal'))).toBe(true);
    expect(lit.eGet(feature(lit, 'literal'))).toBe('Science Fiction');
  });

  it('EOperationImpl and EParameterImpl: eParameters and eType', () => {
    const op = new EOperationImpl();
    op.setName('isOverdue');
    const param = new EParameterImpl();
    param.setName('asOf');
    const eDate = new EDataTypeImpl();
    eDate.setName('EDate');
    param.eSet(feature(param, 'eType'), eDate);

    op.eSet(feature(op, 'eParameters'), [param]);
    expect(op.getEParameters().toArray()).toEqual([param]);
    expect(param.eGet(feature(param, 'eType'))).toBe(eDate);
  });
});

describe('reflective eGet/eSet - non-changeable features', () => {
  it('EClassifier.ePackage can be read but not set', () => {
    const dt = new EDataTypeImpl();
    dt.setName('EString');
    const pkg = new EPackageImpl();
    pkg.setName('lib');
    pkg.getEClassifiers().add(dt);
    dt.setEPackage(pkg);

    expect(dt.eGet(feature(dt, 'ePackage'))).toBe(pkg);
    expect(() => dt.eSet(feature(dt, 'ePackage'), pkg)).toThrow(/has no feature with id/);
  });

  it('EStructuralFeature.eContainingClass can be read but not set', () => {
    const cls = new EClassImpl();
    cls.setName('Book');
    const attr = new EAttributeImpl();
    attr.setName('title');
    attr.setEContainingClass(cls);

    expect(attr.eGet(feature(attr, 'eContainingClass'))).toBe(cls);
    expect(() => attr.eSet(feature(attr, 'eContainingClass'), cls)).toThrow(/has no feature with id/);
  });

  it('EStructuralFeature.containerClass is not a modeled feature and can only be set on the implementation', () => {
    const attr = new EAttributeImpl();
    expect(attr.getContainerClass()).toBeUndefined();
    attr.setContainerClass(EAttributeImpl);
    expect(attr.getContainerClass()).toBe(EAttributeImpl);
    expect(attr.eClass().getEStructuralFeature('containerClass')).toBeUndefined();

    const asInterface: EStructuralFeature = attr;
    // @ts-expect-error setContainerClass is not part of the EStructuralFeature interface.
    asInterface.setContainerClass(EAttributeImpl);
  });

  it('EOperation.operationID defaults to -1 and is not a modeled feature', () => {
    const op = new EOperationImpl();
    expect(op.getOperationID()).toBe(-1);
    op.setOperationID(7);
    expect(op.getOperationID()).toBe(7);
    expect(op.eClass().getEStructuralFeature('operationID')).toBeUndefined();
  });

  it('EOperation.eContainingClass can be read but not set', () => {
    const cls = new EClassImpl();
    cls.setName('Book');
    const op = new EOperationImpl();
    op.setName('describe');
    op.setEContainingClass(cls);

    expect(op.eGet(feature(op, 'eContainingClass'))).toBe(cls);
    expect(() => op.eSet(feature(op, 'eContainingClass'), cls)).toThrow(/has no feature with id/);
  });

  it('EParameter.eOperation can be read but not set', () => {
    const op = new EOperationImpl();
    op.setName('describe');
    const param = new EParameterImpl();
    param.setName('verbose');
    param.setEOperation(op);

    expect(param.eGet(feature(param, 'eOperation'))).toBe(op);
    expect(() => param.eSet(feature(param, 'eOperation'), op)).toThrow(/has no feature with id/);
  });

  it('EPackage.eSuperPackage can be read but not set', () => {
    const parent = new EPackageImpl();
    parent.setName('parent');
    const child = new EPackageImpl();
    child.setName('child');
    child.setESuperPackage(parent);

    expect(child.eGet(feature(child, 'eSuperPackage'))).toBe(parent);
    expect(() => child.eSet(feature(child, 'eSuperPackage'), parent)).toThrow(/has no feature with id/);
  });
});

describe('reflective eGet - derived features', () => {
  it('EClassImpl: eAllSuperTypes, eAllStructuralFeatures and eIDAttribute', () => {
    const eString = new EDataTypeImpl();
    eString.setName('EString');
    const base = new EClassImpl();
    base.setName('Base');
    const baseAttr = new EAttributeImpl();
    baseAttr.setName('id');
    baseAttr.setEType(eString);
    base.getEStructuralFeatures().add(baseAttr);

    const sub = new EClassImpl();
    sub.setName('Sub');
    sub.getESuperTypes().add(base);
    const subAttr = new EAttributeImpl();
    subAttr.setName('name');
    subAttr.setEType(eString);
    subAttr.setID(true);
    sub.getEStructuralFeatures().add(subAttr);

    expect([...(sub.eGet(feature(sub, 'eAllSuperTypes')) as Iterable<unknown>)]).toEqual([base]);
    const allFeatureNames = [...(sub.eGet(feature(sub, 'eAllStructuralFeatures')) as Iterable<EStructuralFeature>)].map(
      (f) => f.getName()
    );
    expect(allFeatureNames).toEqual(['id', 'name']);

    expect(sub.eGet(feature(sub, 'eIDAttribute'))).toBe(subAttr);
  });
});

describe('reflective eGet/eSet - a feature from an unrelated class with the same raw id', () => {
  // Real-world repro: two classes with no relation to each other, each with one attribute at
  // feature id 0 (A.name, B.title) - eGet/eSet/eIsSet/eUnset used to dispatch on
  // feature.getFeatureID() alone, so passing A's feature to a B instance silently read/wrote B's
  // OWN id-0 field instead of rejecting a feature that isn't B's.
  function buildUnrelatedClasses() {
    const ecore = EcorePackageImpl.eINSTANCE;
    const factory = ecore.getEFactoryInstance()!;
    const pkg = new EPackageImpl();
    pkg.setName('p');
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());

    const eString = ecore.getEString();
    const classA = (factory as unknown as { createEClass(): EClassImpl }).createEClass();
    classA.setName('A');
    const aName = new EAttributeImpl();
    aName.setName('name');
    aName.setEType(eString);
    classA.getEStructuralFeatures().add(aName);

    const classB = (factory as unknown as { createEClass(): EClassImpl }).createEClass();
    classB.setName('B');
    const bTitle = new EAttributeImpl();
    bTitle.setName('title');
    bTitle.setEType(eString);
    classB.getEStructuralFeatures().add(bTitle);

    pkg.getEClassifiers().add(classA);
    pkg.getEClassifiers().add(classB);

    expect(aName.getFeatureID()).toBe(bTitle.getFeatureID()); // same raw id, unrelated classes

    const a = createInstanceOf(classA);
    const b = createInstanceOf(classB);
    a.eSet(aName, 'alice');
    b.eSet(bTitle, 'dune');
    return { aName, bTitle, a, b };
  }

  it('eGet rejects a feature belonging to a different class instead of reading the colliding id', () => {
    const { aName, b } = buildUnrelatedClasses();
    expect(() => b.eGet(aName)).toThrow(/The feature 'name' is not a valid feature/);
  });

  it('eSet rejects it instead of overwriting the colliding id', () => {
    const { aName, bTitle, b } = buildUnrelatedClasses();
    expect(() => b.eSet(aName, 'X')).toThrow(/The feature 'name' is not a valid feature/);
    expect(b.eGet(bTitle)).toBe('dune'); // unchanged
  });

  it('eIsSet and eUnset reject it too', () => {
    const { aName, b } = buildUnrelatedClasses();
    expect(() => b.eIsSet(aName)).toThrow(/The feature 'name' is not a valid feature/);
    expect(() => b.eUnset(aName)).toThrow(/The feature 'name' is not a valid feature/);
  });
});
