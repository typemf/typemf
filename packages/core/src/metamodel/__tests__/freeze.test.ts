import { describe, expect, it } from "vitest";
import {
  EAttributeImpl,
  EClassImpl,
  EDataTypeImpl,
  EEnumImpl,
  EEnumLiteralImpl,
  EPackageImpl,
} from "../impl/index";

/**
 * freeze()/isFrozen() are protected, matching real EMF's own access level
 * exactly (an internal construction-lifecycle concern, not a general
 * public API - see the doc comment on EModelElementImpl.freeze()). Tests
 * reach them via a deliberate, narrow cast rather than widening the real
 * access level just to make testing convenient.
 */
function callFreeze(obj: object): void {
  (obj as unknown as { freeze(): void }).freeze();
}
function checkFrozen(obj: object): boolean {
  return (obj as unknown as { isFrozen(): boolean }).isFrozen();
}

describe("freeze()/isFrozen() - cascading immutability marker", () => {
  it("starts unfrozen", () => {
    const pkg = new EPackageImpl();
    expect(checkFrozen(pkg)).toBe(false);
  });

  it("EPackageImpl.freeze() cascades to every classifier it contains", () => {
    const eString = new EDataTypeImpl();
    eString.setName("EString");

    const book = new EClassImpl();
    book.setName("Book");
    const title = new EAttributeImpl();
    title.setName("title");
    title.setEType(eString);
    book.getEStructuralFeatures().add(title);

    const pkg = new EPackageImpl();
    pkg.setName("library");
    pkg.getEClassifiers().add(eString);
    pkg.getEClassifiers().add(book);

    expect(checkFrozen(pkg)).toBe(false);
    expect(checkFrozen(eString)).toBe(false);
    expect(checkFrozen(book)).toBe(false);
    expect(checkFrozen(title)).toBe(false);

    callFreeze(pkg);

    // The package itself, every classifier (including a plain EDataType,
    // which has no freeze() override of its own - it just inherits the
    // base flag-setting behavior, matching real EMF exactly), and - via
    // EClassImpl's own cascade - every structural feature too.
    expect(checkFrozen(pkg)).toBe(true);
    expect(checkFrozen(eString)).toBe(true);
    expect(checkFrozen(book)).toBe(true);
    expect(checkFrozen(title)).toBe(true);
  });

  it("EClassImpl.freeze() alone (without going through a package) still cascades to its own features", () => {
    const eString = new EDataTypeImpl();
    eString.setName("EString");
    const widget = new EClassImpl();
    widget.setName("Widget");
    const name = new EAttributeImpl();
    name.setName("name");
    name.setEType(eString);
    widget.getEStructuralFeatures().add(name);

    callFreeze(widget);

    expect(checkFrozen(widget)).toBe(true);
    expect(checkFrozen(name)).toBe(true);
    // The feature's own type is NOT cascaded to (matches real EMF - eType
    // is a reference, not something this element contains).
    expect(checkFrozen(eString)).toBe(false);
  });

  it("EEnumImpl.freeze() cascades to its own literals - a real gap found and fixed while writing this test (see NOTES.md)", () => {
    const genre = new EEnumImpl();
    genre.setName("Genre");
    const scifi = new EEnumLiteralImpl();
    scifi.setName("SciFi");
    genre.getELiterals().add(scifi);

    expect(checkFrozen(genre)).toBe(false);
    expect(checkFrozen(scifi)).toBe(false);

    callFreeze(genre);

    expect(checkFrozen(genre)).toBe(true);
    expect(checkFrozen(scifi)).toBe(true);
  });

  it("EPackageImpl.freeze() reaches an EEnum literal transitively (package -> EEnum -> literal)", () => {
    const genre = new EEnumImpl();
    genre.setName("Genre");
    const scifi = new EEnumLiteralImpl();
    scifi.setName("SciFi");
    genre.getELiterals().add(scifi);

    const pkg = new EPackageImpl();
    pkg.setName("lib");
    pkg.getEClassifiers().add(genre);

    callFreeze(pkg);

    expect(checkFrozen(genre)).toBe(true);
    expect(checkFrozen(scifi)).toBe(true);
  });
});
