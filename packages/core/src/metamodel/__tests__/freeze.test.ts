import { describe, expect, it } from 'vitest';
import { EAttributeImpl } from '../impl/EAttributeImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { EEnumImpl } from '../impl/EEnumImpl.js';
import { EEnumLiteralImpl } from '../impl/EEnumLiteralImpl.js';
import { EPackageImpl } from '../impl/EPackageImpl.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

// freeze() and isFrozen() are protected, as in EMF.
function callFreeze(obj: object): void {
  (obj as unknown as { freeze(): void }).freeze();
}
function checkFrozen(obj: object): boolean {
  return (obj as unknown as { isFrozen(): boolean }).isFrozen();
}

describe('freeze()', () => {
  it('starts unfrozen', () => {
    const pkg = new EPackageImpl();
    expect(checkFrozen(pkg)).toBe(false);
  });

  it('on a package freezes its classifiers and their features', () => {
    const eString = new EDataTypeImpl();
    eString.setName('EString');

    const book = new EClassImpl();
    book.setName('Book');
    const title = new EAttributeImpl();
    title.setName('title');
    title.setEType(eString);
    book.getEStructuralFeatures().add(title);

    const pkg = new EPackageImpl();
    pkg.setName('library');
    pkg.getEClassifiers().add(eString);
    pkg.getEClassifiers().add(book);

    expect(checkFrozen(pkg)).toBe(false);
    expect(checkFrozen(eString)).toBe(false);
    expect(checkFrozen(book)).toBe(false);
    expect(checkFrozen(title)).toBe(false);

    callFreeze(pkg);

    expect(checkFrozen(pkg)).toBe(true);
    expect(checkFrozen(eString)).toBe(true);
    expect(checkFrozen(book)).toBe(true);
    expect(checkFrozen(title)).toBe(true);
  });

  it('on a class freezes its features but not their types', () => {
    const eString = new EDataTypeImpl();
    eString.setName('EString');
    const widget = new EClassImpl();
    widget.setName('Widget');
    const name = new EAttributeImpl();
    name.setName('name');
    name.setEType(eString);
    widget.getEStructuralFeatures().add(name);

    callFreeze(widget);

    expect(checkFrozen(widget)).toBe(true);
    expect(checkFrozen(name)).toBe(true);
    expect(checkFrozen(eString)).toBe(false);
  });

  it('on an enum freezes its literals', () => {
    const genre = new EEnumImpl();
    genre.setName('Genre');
    const scifi = new EEnumLiteralImpl();
    scifi.setName('SciFi');
    genre.getELiterals().add(scifi);

    expect(checkFrozen(genre)).toBe(false);
    expect(checkFrozen(scifi)).toBe(false);

    callFreeze(genre);

    expect(checkFrozen(genre)).toBe(true);
    expect(checkFrozen(scifi)).toBe(true);
  });

  it('on a package freezes the literals of its enums', () => {
    const genre = new EEnumImpl();
    genre.setName('Genre');
    const scifi = new EEnumLiteralImpl();
    scifi.setName('SciFi');
    genre.getELiterals().add(scifi);

    const pkg = new EPackageImpl();
    pkg.setName('lib');
    pkg.getEClassifiers().add(genre);

    callFreeze(pkg);

    expect(checkFrozen(genre)).toBe(true);
    expect(checkFrozen(scifi)).toBe(true);
  });
});
