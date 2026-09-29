import { describe, expect, it } from 'vitest';
import { EAnnotationImpl } from '../impl/EAnnotationImpl.js';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
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
// See NOTES.md's point 6 write-up: every generated setter routes through getEcorePackageRef(), which
// needs Ecore's own metaclass system bootstrapped first - this triggers that safely before any test
// in this file constructs a raw metaclass instance.
void EcorePackageImpl.eINSTANCE;

/**
 * The REAL, registered feature named `name`, looked up reflectively via `owner`'s own `eClass()` - not
 * a standalone, freshly-constructed fake one. Generated `eGet`/`eSet` dispatch by `featureID` (a real,
 * assigned number - see id-assignment.ts), not by name; a fake feature never has one (defaults to -1),
 * so it can never match a real case once generated classes back `owner`. Found by actually running this
 * suite against the swap, not predicted - hand-written classes used to dispatch by name, which is why
 * this worked before.
 */
function feature(owner: EObject, name: string): EStructuralFeature {
  const found = owner.eClass().getEStructuralFeature(name);
  if (!found) throw new Error(`No real feature named '${name}' on ${owner.eClass().getName()} - check the spelling against the real model.`);
  return found;
}

describe('reflective eGet/eSet - deep inheritance fallthrough', () => {
  it('EAttributeImpl.eGet() reaches "eAnnotations", declared 3 levels up on EModelElementImpl', () => {
    const attr = new EAttributeImpl();
    attr.setName('title');
    const annotation = new EAnnotationImpl();
    annotation.setSource('http://example.com');
    attr.getEAnnotations().add(annotation);

    // EAttributeImpl -> EStructuralFeatureImpl -> ETypedElementImpl ->
    // ENamedElementImpl -> EModelElementImpl - "eAnnotations" is declared
    // on the base, reached only via the full super() chain.
    const result = attr.eGet(feature(attr, 'eAnnotations'));
    expect(result).toBe(attr.getEAnnotations());
  });

  it('EEnumImpl.eGet() reaches "name", declared 2 levels up on ENamedElementImpl, and its own "eLiterals"', () => {
    const en = new EEnumImpl();
    en.setName('Genre');
    expect(en.eGet(feature(en, 'name'))).toBe('Genre');
    expect(en.eGet(feature(en, 'eLiterals'))).toBe(en.getELiterals());
  });

  it('a genuinely unknown feature name is rejected at lookup - there is no real featureID to construct a standalone feature object for anymore, unlike hand-written core\'s old name-based dispatch', () => {
    const attr = new EAttributeImpl();
    expect(() => feature(attr, 'doesNotExist')).toThrow(/No real feature named 'doesNotExist' on EAttribute/);
  });

  it('eGet still throws a clear error for a real feature that genuinely is not one of this class\'s own or inherited features', () => {
    const attr = new EAttributeImpl();
    // A standalone, throwaway feature with a featureID (9999) deliberately outside EAttribute's own
    // numbering (its features top out well below that) - a guaranteed mismatch, exercising eGet's
    // own "unrecognized featureID" path directly, without mutating any real, shared metaclass object
    // (EcorePackageImpl.eINSTANCE is a singleton, shared across every test in this file/process).
    // (An earlier version of this test picked the real EPackage.nsURI feature itself, whose real
    // featureID (2) turned out to coincidentally fall within EAttribute's own range - not a mismatch
    // at all, found by running it.)
    const bogus = new EAttributeImpl();
    (bogus as unknown as { setFeatureID(id: number): void }).setFeatureID(9999);
    expect(() => attr.eGet(bogus)).toThrow(/has no feature with id/);
  });
});

describe('reflective eGet/eSet - own features, round-tripped through eSet then eGet', () => {
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

  it('EPackageImpl: nsURI, nsPrefix, eClassifiers, eFactoryInstance (changeable, unlike eSuperPackage)', () => {
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

  it('EReferenceImpl: containment, eOpposite - and the derived "container"/"eReferenceType" verified against real EMF semantics', () => {
    const a = new EReferenceImpl();
    a.setName('a');
    const b = new EReferenceImpl();
    b.setName('b');
    a.eSet(feature(a, 'containment'), true);
    a.eSet(feature(a, 'eOpposite'), b);
    b.eSet(feature(b, 'eOpposite'), a);

    expect(a.eGet(feature(a, 'containment'))).toBe(true);
    expect(a.eGet(feature(a, 'eOpposite'))).toBe(b);
    // b's "container" is derived from ITS OWN eOpposite (a) being a
    // containment reference - verified against real
    // EReferenceImpl.isContainer() in the Java source, not assumed.
    expect(b.eGet(feature(b, 'container'))).toBe(true);
    expect(a.eGet(feature(a, 'container'))).toBe(false); // a's own opposite (b) is not containment
  });

  it("EEnumLiteralImpl: value, literal - and eIsSet distinguishes 'explicitly set' from getLiteral()'s name-fallback", () => {
    const lit = new EEnumLiteralImpl();
    lit.setName('SciFi');
    expect(lit.eIsSet(feature(lit, 'literal'))).toBe(false); // never explicitly set
    expect(lit.getLiteral()).toBe('SciFi'); // but getLiteral() still falls back to name

    lit.eSet(feature(lit, 'literal'), 'Science Fiction');
    expect(lit.eIsSet(feature(lit, 'literal'))).toBe(true);
    expect(lit.eGet(feature(lit, 'literal'))).toBe('Science Fiction');
  });

  it("EOperationImpl and EParameterImpl: eParameters, and a parameter's own eType (inherited from ETypedElementImpl with no override needed)", () => {
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

describe('reflective eGet/eSet - non-changeable features are readable but not settable, matching real EMF exactly', () => {
  it('EClassifier.ePackage: readable via eGet, but eSet falls through to "unknown feature"', () => {
    const dt = new EDataTypeImpl();
    dt.setName('EString');
    const pkg = new EPackageImpl();
    pkg.setName('lib');
    pkg.getEClassifiers().add(dt);
    dt.setEPackage(pkg);

    expect(dt.eGet(feature(dt, 'ePackage'))).toBe(pkg);
    expect(() => dt.eSet(feature(dt, 'ePackage'), pkg)).toThrow(/has no feature with id/);
  });

  it('EStructuralFeature.eContainingClass: readable, not settable', () => {
    const cls = new EClassImpl();
    cls.setName('Book');
    const attr = new EAttributeImpl();
    attr.setName('title');
    attr.setEContainingClass(cls);

    expect(attr.eGet(feature(attr, 'eContainingClass'))).toBe(cls);
    expect(() => attr.eSet(feature(attr, 'eContainingClass'), cls)).toThrow(/has no feature with id/);
  });

  it('EStructuralFeature.getContainerClass()/setContainerClass(): public getter, impl-only setter - matches real EMF exactly (D3, EStructuralFeatureImpl.setContainerClass is not on the EStructuralFeature interface at all, only reachable via the concrete impl)', () => {
    const attr = new EAttributeImpl();
    expect(attr.getContainerClass()).toBeUndefined();
    attr.setContainerClass(EAttributeImpl);
    expect(attr.getContainerClass()).toBe(EAttributeImpl);
    // Not reachable via eGet/eSet either - matches featureID's own bookkeeping exclusion. It isn't
    // even a real, modeled Ecore feature, so the lookup itself (not eGet) is what rejects it.
    expect(() => feature(attr, 'containerClass')).toThrow(/No real feature named 'containerClass'/);

    // Real, compile-time proof that setContainerClass is genuinely absent from the public interface,
    // not just "impl has it too" - if this ever stops being a type error, this test file fails to
    // compile at all (tsc -p tsconfig.json --noEmit), which is exactly the signal wanted.
    const asInterface: EStructuralFeature = attr;
    // @ts-expect-error setContainerClass is deliberately not on the EStructuralFeature interface - matches real EMF exactly.
    asInterface.setContainerClass(EAttributeImpl);
  });

  it('EOperation.operationID: a plain stored field, defaulting to -1, not reachable via eGet/eSet - matches featureID exactly (internal bookkeeping, not a real modeled Ecore feature), added for point 4', () => {
    const op = new EOperationImpl();
    expect(op.getOperationID()).toBe(-1);
    op.setOperationID(7);
    expect(op.getOperationID()).toBe(7);
    // Not a real, modeled Ecore feature either - the lookup itself rejects it, not eGet.
    expect(() => feature(op, 'operationID')).toThrow(/No real feature named 'operationID'/);
  });

  it('EOperation.eContainingClass: readable, not settable - same pattern as EStructuralFeature.eContainingClass, added for point 3 (operations at runtime)', () => {
    const cls = new EClassImpl();
    cls.setName('Book');
    const op = new EOperationImpl();
    op.setName('describe');
    op.setEContainingClass(cls);

    expect(op.eGet(feature(op, 'eContainingClass'))).toBe(cls);
    expect(() => op.eSet(feature(op, 'eContainingClass'), cls)).toThrow(/has no feature with id/);
  });

  it('EParameter.eOperation: readable, not settable - the inverse of EOperation.eParameters, added for point 3', () => {
    const op = new EOperationImpl();
    op.setName('describe');
    const param = new EParameterImpl();
    param.setName('verbose');
    param.setEOperation(op);

    expect(param.eGet(feature(param, 'eOperation'))).toBe(op);
    expect(() => param.eSet(feature(param, 'eOperation'), op)).toThrow(/has no feature with id/);
  });

  it('EPackage.eSuperPackage: readable, not settable (unlike eFactoryInstance on the same class)', () => {
    const parent = new EPackageImpl();
    parent.setName('parent');
    const child = new EPackageImpl();
    child.setName('child');
    child.setESuperPackage(parent);

    expect(child.eGet(feature(child, 'eSuperPackage'))).toBe(parent);
    expect(() => child.eSet(feature(child, 'eSuperPackage'), parent)).toThrow(/has no feature with id/);
  });
});

describe('reflective eGet - derived features return real, correct computed values (not stubs)', () => {
  it('EClassImpl.eAllSuperTypes / eAllStructuralFeatures reflect real inheritance', () => {
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
    const allFeatureNames = [...(sub.eGet(feature(sub, 'eAllStructuralFeatures')) as Iterable<EStructuralFeature>)].map((f) =>
      f.getName()
    );
    expect(allFeatureNames).toEqual(['id', 'name']);

    // getEIDAttribute() - added as part of this work, previously missing
    // entirely (not just undispatched).
    expect(sub.eGet(feature(sub, 'eIDAttribute'))).toBe(subAttr);
  });
});
