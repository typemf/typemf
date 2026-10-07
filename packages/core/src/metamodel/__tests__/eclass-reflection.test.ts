import { describe, expect, it } from 'vitest';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { DynamicEObjectImpl } from '../impl/DynamicEObjectImpl.js';
import { createInstanceOf } from '../impl/metamodel-helpers.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { buildSampleMetamodel } from './sample-metamodel.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

describe('EClass reflection', () => {
  it('exposes declared-only features via getEStructuralFeatures()', () => {
    const { bookClass, titleAttr, pageCountAttr } = buildSampleMetamodel();
    expect(bookClass.getEStructuralFeatures().toArray()).toEqual([titleAttr, pageCountAttr]);
  });

  it('inherits supertype features via getEAllStructuralFeatures(), supertype-first', () => {
    const { audioBookClass, titleAttr, pageCountAttr, narratorAttr } = buildSampleMetamodel();
    expect([...audioBookClass.getEAllStructuralFeatures()]).toEqual([titleAttr, pageCountAttr, narratorAttr]);
  });

  it('separates attributes from references in getEAllAttributes/getEAllReferences', () => {
    const { libraryClass, booksRef, featuredBookRef } = buildSampleMetamodel();
    expect([...libraryClass.getEAllAttributes()]).toEqual([]);
    expect([...libraryClass.getEAllReferences()]).toEqual([booksRef, featuredBookRef]);
    expect([...libraryClass.getEAllContainments()]).toEqual([booksRef]);
  });

  it('isSuperTypeOf is reflexive and covers the inheritance chain', () => {
    const { bookClass, audioBookClass, libraryClass } = buildSampleMetamodel();
    expect(bookClass.isSuperTypeOf(bookClass)).toBe(true);
    expect(bookClass.isSuperTypeOf(audioBookClass)).toBe(true);
    expect(audioBookClass.isSuperTypeOf(bookClass)).toBe(false);
    expect(libraryClass.isSuperTypeOf(bookClass)).toBe(false);
  });

  it('getEStructuralFeature(featureID) finds inherited features by id', () => {
    const { audioBookClass, titleAttr, narratorAttr } = buildSampleMetamodel();
    expect(audioBookClass.getEStructuralFeature(0)).toBe(titleAttr);
    expect(audioBookClass.getEStructuralFeature(2)).toBe(narratorAttr);
  });

  it('getEStructuralFeature(name) finds inherited features by name', () => {
    const { audioBookClass } = buildSampleMetamodel();
    expect(audioBookClass.getEStructuralFeature('title')?.getName()).toBe('title');
    expect(audioBookClass.getEStructuralFeature('narrator')?.getName()).toBe('narrator');
    expect(audioBookClass.getEStructuralFeature('doesNotExist')).toBeUndefined();
  });

  it('getEStructuralFeature(id) and getEStructuralFeature(name) return the same feature', () => {
    const { audioBookClass } = buildSampleMetamodel();
    const byName = audioBookClass.getEStructuralFeature('title');
    const id = byName!.getFeatureID();
    expect(audioBookClass.getEStructuralFeature(id)).toBe(byName);
  });

  it("createInstanceOf() uses the EClass's EPackage EFactoryInstance", () => {
    const { bookClass } = buildSampleMetamodel();
    const instance = createInstanceOf(bookClass);
    expect(instance.eClass()).toBe(bookClass);
  });

  it('createInstanceOf() throws a clear error when no factory is registered', () => {
    const { bookClass } = buildSampleMetamodel();
    bookClass.getEPackage()!.setEFactoryInstance(undefined);
    expect(() => createInstanceOf(bookClass)).toThrow(/no EFactoryInstance registered/);
  });
});

/**
 *        Base (id)
 *       /    \
 *  Movable  Named   (position / label)
 *       \    /
 *      Sprite
 */
function buildDiamondMetamodel() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');

  const base = new EClassImpl();
  base.setName('Base');
  const idAttr = new EAttributeImpl();
  idAttr.setName('id');
  idAttr.setEType(eString);
  idAttr.setFeatureID(0);
  base.getEStructuralFeatures().add(idAttr);

  const movable = new EClassImpl();
  movable.setName('Movable');
  movable.getESuperTypes().add(base);
  const positionAttr = new EAttributeImpl();
  positionAttr.setName('position');
  positionAttr.setEType(eString);
  positionAttr.setFeatureID(1);
  movable.getEStructuralFeatures().add(positionAttr);

  const named = new EClassImpl();
  named.setName('Named');
  named.getESuperTypes().add(base);
  const labelAttr = new EAttributeImpl();
  labelAttr.setName('label');
  labelAttr.setEType(eString);
  labelAttr.setFeatureID(1);
  named.getEStructuralFeatures().add(labelAttr);

  const sprite = new EClassImpl();
  sprite.setName('Sprite');
  sprite.getESuperTypes().add(movable);
  sprite.getESuperTypes().add(named);

  return { base, movable, named, sprite, idAttr, positionAttr, labelAttr };
}

describe('EClass reflection - diamond inheritance', () => {
  it('eAllSuperTypes includes every ancestor exactly once, even when reachable via two paths', () => {
    const { base, movable, named, sprite } = buildDiamondMetamodel();
    const supers = [...sprite.getEAllSuperTypes()];
    expect(supers).toHaveLength(3);
    expect(supers).toContain(base);
    expect(supers).toContain(movable);
    expect(supers).toContain(named);
    expect(supers.filter((s) => s === base)).toHaveLength(1);
  });

  it("eAllStructuralFeatures includes Base's shared feature exactly once, plus every branch's own feature", () => {
    const { sprite, idAttr, positionAttr, labelAttr } = buildDiamondMetamodel();
    const features = [...sprite.getEAllStructuralFeatures()];
    expect(features).toContain(idAttr);
    expect(features).toContain(positionAttr);
    expect(features).toContain(labelAttr);
    expect(features.filter((f) => f === idAttr)).toHaveLength(1);
    expect(features).toHaveLength(3);
  });

  it('isSuperTypeOf recognizes both branches of the diamond', () => {
    const { base, movable, named, sprite } = buildDiamondMetamodel();
    expect(base.isSuperTypeOf(sprite)).toBe(true);
    expect(movable.isSuperTypeOf(sprite)).toBe(true);
    expect(named.isSuperTypeOf(sprite)).toBe(true);
  });

  // Movable.position and Named.label each have their own, independently-assigned
  // featureID (1) - correct within their own declaring class, but colliding if Sprite's
  // getFeatureID(feature) just returned that raw value instead of each feature's own distinct
  // position within Sprite's own getEAllStructuralFeatures().
  it("getFeatureID(feature) returns feature's position in getEAllStructuralFeatures(), not its own, per-declaring-class featureID", () => {
    const { sprite, movable, named, idAttr, positionAttr, labelAttr } = buildDiamondMetamodel();
    expect(movable.getFeatureID(positionAttr)).toBe(1);
    expect(named.getFeatureID(labelAttr)).toBe(1); // same raw id as Movable.position - fine, different class

    const all = [...sprite.getEAllStructuralFeatures()];
    expect(sprite.getFeatureID(idAttr)).toBe(all.indexOf(idAttr));
    expect(sprite.getFeatureID(positionAttr)).toBe(all.indexOf(positionAttr));
    expect(sprite.getFeatureID(labelAttr)).toBe(all.indexOf(labelAttr));
    expect(sprite.getFeatureID(positionAttr)).not.toBe(sprite.getFeatureID(labelAttr));
  });

  it('getEStructuralFeature(id) is the exact inverse of getFeatureID(feature)', () => {
    const { sprite, idAttr, positionAttr, labelAttr } = buildDiamondMetamodel();
    for (const feature of [idAttr, positionAttr, labelAttr]) {
      expect(sprite.getEStructuralFeature(sprite.getFeatureID(feature))).toBe(feature);
    }
  });

  it('a dynamic instance keeps both diamond branches apart instead of one overwriting the other', () => {
    const { sprite, positionAttr, labelAttr } = buildDiamondMetamodel();
    const instance = new DynamicEObjectImpl(sprite);

    instance.eSet(positionAttr, 'top-left');
    instance.eSet(labelAttr, 'Player');

    expect(instance.eGet(positionAttr)).toBe('top-left');
    expect(instance.eGet(labelAttr)).toBe('Player');
  });
});

describe('EClass reflection - derived lists after edits', () => {
  it('getEAllStructuralFeatures() reflects features added to the class and its supertypes later', () => {
    const { bookClass, audioBookClass } = buildSampleMetamodel();
    expect(audioBookClass.getEAllStructuralFeatures().size()).toBe(3);

    const isbn = new EAttributeImpl();
    isbn.setName('isbn');
    bookClass.getEStructuralFeatures().add(isbn);
    expect([...audioBookClass.getEAllStructuralFeatures()]).toContain(isbn);

    bookClass.getEStructuralFeatures().remove(isbn);
    expect([...audioBookClass.getEAllStructuralFeatures()]).not.toContain(isbn);
  });

  it('getEAllSuperTypes() and getEAllStructuralFeatures() reflect supertypes added later', () => {
    const { base, idAttr } = buildDiamondMetamodel();
    const thing = new EClassImpl();
    expect(thing.getEAllSuperTypes().size()).toBe(0);

    thing.getESuperTypes().add(base);
    expect([...thing.getEAllSuperTypes()]).toEqual([base]);
    expect([...thing.getEAllStructuralFeatures()]).toEqual([idAttr]);
  });

  it('getEAllContainments() reflects a reference that becomes a containment later', () => {
    const { libraryClass, booksRef, featuredBookRef } = buildSampleMetamodel();
    featuredBookRef.setContainment(true);
    expect([...libraryClass.getEAllContainments()]).toEqual([booksRef, featuredBookRef]);
  });
});
