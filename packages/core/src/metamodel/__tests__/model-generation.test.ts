import { describe, expect, it } from 'vitest';
import { BasicEList } from '../impl/BasicEList.js';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { DynamicEObjectImpl } from '../impl/DynamicEObjectImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EGenericTypeImpl } from '../impl/EGenericTypeImpl.js';
import { EObjectImpl } from '../impl/EObjectImpl.js';
import { EOperationImpl } from '../impl/EOperationImpl.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
// See NOTES.md's point 6 write-up: every generated setter routes through getEcorePackageRef(), which
// needs Ecore's own metaclass system bootstrapped first - this triggers that safely before any test
// in this file constructs a raw metaclass instance.
void EcorePackageImpl.eINSTANCE;

/**
 * eDidAdd/eDidRemove only fire when a BasicEList is constructed WITH an owner and a feature (see
 * BasicEList.onAdded/onRemoved) - the shape GENERATED code always uses (`new BasicEList(this,
 * get{Pkg}Ref().get{Class}_{Feature}())`), but NOT the shape hand-written EClassImpl's own fields use
 * (plain `new BasicEList<EClass>()`, with containment wired explicitly via setEContainingClass instead -
 * a real, pre-existing, unrelated difference, confirmed by reading EClassImpl.ts). So this constructs
 * the list the way GENERATED code does, rather than testing against EClassImpl's own (differently-wired)
 * lists, which would never fire the hook at all.
 */
/**
 * `owner` must be a real EObjectImpl - hand-written EClassImpl is NOT one (a real, separate discovery:
 * hand-written core's metamodel-of-the-metamodel classes (EModelElementImpl and everything under it)
 * implement EModelElement directly, with NO EObjectImpl base at all, unlike GENERATED code, where
 * EModelElementImpl DOES extend EObjectImpl - confirmed by comparing both). DynamicEObjectImpl stands
 * in as a real, concrete EObjectImpl for this test; the EClassImpl it wraps is only there to satisfy
 * its constructor's EClass parameter, not to be the owner itself.
 */
function newOwner(): EObjectImpl {
  return new DynamicEObjectImpl(new EClassImpl());
}

function ownedList<T>(owner: EObjectImpl, featureName: string): BasicEList<T> {
  const feature = new EAttributeImpl();
  feature.setName(featureName);
  return new BasicEList<T>(owner, feature);
}

describe('EObjectImpl.getModelGeneration() - the counter generated caches key off', () => {
  it('bumps when eStructuralFeatures changes, via add() on a properly owner+feature-wired list', () => {
    const owner = newOwner();
    const list = ownedList<EAttributeImpl>(owner, 'eStructuralFeatures');
    const before = EObjectImpl.getModelGeneration();
    list.add(new EAttributeImpl());
    expect(EObjectImpl.getModelGeneration()).toBeGreaterThan(before);
  });

  it('bumps when eOperations changes', () => {
    const owner = newOwner();
    const list = ownedList<EOperationImpl>(owner, 'eOperations');
    const before = EObjectImpl.getModelGeneration();
    list.add(new EOperationImpl());
    expect(EObjectImpl.getModelGeneration()).toBeGreaterThan(before);
  });

  it('bumps when eSuperTypes changes', () => {
    const owner = newOwner();
    const list = ownedList<EClassImpl>(owner, 'eSuperTypes');
    const before = EObjectImpl.getModelGeneration();
    list.add(new EClassImpl());
    expect(EObjectImpl.getModelGeneration()).toBeGreaterThan(before);
  });

  it('bumps when eGenericSuperTypes changes', () => {
    const owner = newOwner();
    const list = ownedList<EGenericTypeImpl>(owner, 'eGenericSuperTypes');
    const before = EObjectImpl.getModelGeneration();
    list.add(new EGenericTypeImpl());
    expect(EObjectImpl.getModelGeneration()).toBeGreaterThan(before);
  });

  it('bumps on removal too, not just addition', () => {
    const owner = newOwner();
    const list = ownedList<EAttributeImpl>(owner, 'eStructuralFeatures');
    const attr = new EAttributeImpl();
    list.add(attr);
    const before = EObjectImpl.getModelGeneration();
    list.remove(attr);
    expect(EObjectImpl.getModelGeneration()).toBeGreaterThan(before);
  });

  it('bumps for ANY feature name, not only the four metamodel-structural ones - deliberately broad: a `get` body can depend on any feature, not just structural relationships (see eDidAdd\'s own doc comment for why a narrower, name-based filter was tried and found wrong)', () => {
    const owner = newOwner();
    const list = ownedList<EAttributeImpl>(owner, 'eAnnotations');
    const before = EObjectImpl.getModelGeneration();
    list.add(new EAttributeImpl());
    expect(EObjectImpl.getModelGeneration()).toBeGreaterThan(before);
  });

  it('bumps for a plain single-valued ATTRIBUTE change too, not just many-valued reference lists - the exact gap that made a `get` body reading an ordinary attribute go stale', () => {
    const owner = newOwner();
    const feature = new EAttributeImpl();
    feature.setName('someAttribute');
    const before = EObjectImpl.getModelGeneration();
    owner.eDidAdd(feature, 'some value'); // mirrors what eSet's default single-valued dance calls
    expect(EObjectImpl.getModelGeneration()).toBeGreaterThan(before);
  });

  it('is GLOBAL: bumped by a change on ANY instance, readable the same way from anywhere', () => {
    const a = newOwner();
    const list = ownedList<EAttributeImpl>(a, 'eStructuralFeatures');
    const before = EObjectImpl.getModelGeneration();
    list.add(new EAttributeImpl());
    // A second, entirely unrelated object reads the SAME counter, already bumped.
    const unrelatedReader = EObjectImpl.getModelGeneration();
    expect(unrelatedReader).toBeGreaterThan(before);
  });

  it('a list with no owner/feature (matching how EClassImpl builds its OWN lists) never fires the hook at all', () => {
    const bare = new BasicEList<EAttributeImpl>();
    const before = EObjectImpl.getModelGeneration();
    bare.add(new EAttributeImpl());
    expect(EObjectImpl.getModelGeneration()).toBe(before); // confirms the pre-existing, unrelated gap this test file's own comment describes
  });
});
