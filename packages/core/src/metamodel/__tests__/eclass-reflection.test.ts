import { describe, expect, it } from "vitest";
import { buildSampleMetamodel } from "./sample-metamodel.js";

import { EAttributeImpl, EClassImpl, EDataTypeImpl } from "../impl/index";

describe("EClass reflection", () => {
  it("exposes declared-only features via getEStructuralFeatures()", () => {
    const { bookClass, titleAttr, pageCountAttr } = buildSampleMetamodel();
    expect(bookClass.getEStructuralFeatures().toArray()).toEqual([
      titleAttr,
      pageCountAttr,
    ]);
  });

  it("inherits supertype features via getEAllStructuralFeatures(), supertype-first", () => {
    const { audioBookClass, titleAttr, pageCountAttr, narratorAttr } =
      buildSampleMetamodel();
    expect(audioBookClass.getEAllStructuralFeatures()).toEqual([
      titleAttr,
      pageCountAttr,
      narratorAttr,
    ]);
  });

  it("separates attributes from references in getEAllAttributes/getEAllReferences", () => {
    const { libraryClass, booksRef, featuredBookRef } = buildSampleMetamodel();
    expect(libraryClass.getEAllAttributes()).toEqual([]);
    expect(libraryClass.getEAllReferences()).toEqual([
      booksRef,
      featuredBookRef,
    ]);
    expect(libraryClass.getEAllContainments()).toEqual([booksRef]);
  });

  it("isSuperTypeOf is reflexive and covers the inheritance chain", () => {
    const { bookClass, audioBookClass, libraryClass } = buildSampleMetamodel();
    expect(bookClass.isSuperTypeOf(bookClass)).toBe(true);
    expect(bookClass.isSuperTypeOf(audioBookClass)).toBe(true);
    expect(audioBookClass.isSuperTypeOf(bookClass)).toBe(false);
    expect(libraryClass.isSuperTypeOf(bookClass)).toBe(false);
  });

  it("getEStructuralFeature(featureID) finds inherited features by id", () => {
    const { audioBookClass, titleAttr, narratorAttr } = buildSampleMetamodel();
    expect(audioBookClass.getEStructuralFeature(0)).toBe(titleAttr);
    expect(audioBookClass.getEStructuralFeature(2)).toBe(narratorAttr);
  });

  it("getEStructuralFeatureByName resolves across the whole hierarchy", () => {
    const { audioBookClass } = buildSampleMetamodel();
    expect(
      audioBookClass
        .getEStructuralFeatures()
        .filter((f) => f.getName() === "title")
        .at(0)
        ?.getName(),
    ).toBe("title");
    expect(
      audioBookClass
        .getEStructuralFeatures()
        .filter((f) => f.getName() === "narrator")
        .at(0)
        ?.getName(),
    ).toBe("narrator");
    expect(
      audioBookClass
        .getEStructuralFeatures()
        .filter((f) => f.getName() === "doesNotExist").length,
    ).toBe(0);
  });

  it("createInstance() uses the EClass's EPackage EFactoryInstance", () => {
    const { bookClass } = buildSampleMetamodel();
    const instance = bookClass.createInstance();
    expect(instance.eClass()).toBe(bookClass);
  });

  it("createInstance() throws a clear error when no factory is registered", () => {
    const { bookClass } = buildSampleMetamodel();
    bookClass.getEPackage()!.setEFactoryInstance(undefined);
    expect(() => bookClass.createInstance()).toThrow(
      /no EFactoryInstance registered/,
    );
  });
});

/**
 * eSuperTypes is many-valued - real multiple inheritance, not just single
 * chains, is structurally supported and exercised nowhere above. Builds a
 * genuine diamond:
 *
 *        Base (feature: id)
 *       /    \
 *  Movable  Named   (features: position / label)
 *       \    /
 *      Sprite
 *
 * recomputeAllLists() dedups via a Set<EClass>, specifically to handle
 * exactly this shape (Base reachable via two paths) without visiting it,
 * or its features, twice.
 */
function buildDiamondMetamodel() {
  const eString = new EDataTypeImpl();
  eString.setName("EString");

  const base = new EClassImpl();
  base.setName("Base");
  const idAttr = new EAttributeImpl();
  idAttr.setName("id");
  idAttr.setEType(eString);
  idAttr.setFeatureID(0);
  base.getEStructuralFeatures().add(idAttr);

  const movable = new EClassImpl();
  movable.setName("Movable");
  movable.getESuperTypes().add(base);
  const positionAttr = new EAttributeImpl();
  positionAttr.setName("position");
  positionAttr.setEType(eString);
  positionAttr.setFeatureID(1);
  movable.getEStructuralFeatures().add(positionAttr);

  const named = new EClassImpl();
  named.setName("Named");
  named.getESuperTypes().add(base);
  const labelAttr = new EAttributeImpl();
  labelAttr.setName("label");
  labelAttr.setEType(eString);
  labelAttr.setFeatureID(1);
  named.getEStructuralFeatures().add(labelAttr);

  const sprite = new EClassImpl();
  sprite.setName("Sprite");
  sprite.getESuperTypes().add(movable);
  sprite.getESuperTypes().add(named);

  for (const c of [base, movable, named, sprite]) c.recomputeAllLists();

  return { base, movable, named, sprite, idAttr, positionAttr, labelAttr };
}

describe("EClass reflection - diamond (multiple) inheritance", () => {
  it("eAllSuperTypes includes every ancestor exactly once, even when reachable via two paths", () => {
    const { base, movable, named, sprite } = buildDiamondMetamodel();
    const supers = sprite.getEAllSuperTypes();
    expect(supers).toHaveLength(3);
    expect(supers).toContain(base);
    expect(supers).toContain(movable);
    expect(supers).toContain(named);
    // Specifically: base is not duplicated despite being reachable via
    // both Movable and Named.
    expect(supers.filter((s) => s === base)).toHaveLength(1);
  });

  it("eAllStructuralFeatures includes Base's shared feature exactly once, plus every branch's own feature", () => {
    const { sprite, idAttr, positionAttr, labelAttr } = buildDiamondMetamodel();
    const features = sprite.getEAllStructuralFeatures();
    expect(features).toContain(idAttr);
    expect(features).toContain(positionAttr);
    expect(features).toContain(labelAttr);
    expect(features.filter((f) => f === idAttr)).toHaveLength(1);
    expect(features).toHaveLength(3);
  });

  it("isSuperTypeOf recognizes both branches of the diamond", () => {
    const { base, movable, named, sprite } = buildDiamondMetamodel();
    expect(base.isSuperTypeOf(sprite)).toBe(true);
    expect(movable.isSuperTypeOf(sprite)).toBe(true);
    expect(named.isSuperTypeOf(sprite)).toBe(true);
  });
});
