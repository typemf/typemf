import { createInstanceOf, DynamicEFactoryImpl, EAttributeImpl, EcorePackageImpl, EClassImpl, EDataTypeImpl, EPackageImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { displayLabel } from '../display-label.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');
  const bookClass = new EClassImpl();
  bookClass.setName('Book');
  const nameAttr = new EAttributeImpl();
  nameAttr.setName('name');
  nameAttr.setEType(eString);
  nameAttr.setFeatureID(0);
  bookClass.getEStructuralFeatures().add(nameAttr);

  const noNameClass = new EClassImpl();
  noNameClass.setName('Plain');

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().add(bookClass);
  pkg.getEClassifiers().add(noNameClass);
  bookClass.setEPackage(pkg);
  noNameClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return { bookClass, nameAttr, noNameClass };
}

describe('displayLabel', () => {
  it('uses the "name" feature value when it has one and it is set', () => {
    const { bookClass, nameAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    book.eSet(nameAttr, 'Dune');
    expect(displayLabel(book)).toBe('Dune');
  });

  it('falls back to the class name when "name" is not set', () => {
    const { bookClass } = buildFixture();
    const book = createInstanceOf(bookClass);
    expect(displayLabel(book)).toBe('Book');
  });

  it('falls back to the class name when the class has no "name" feature at all', () => {
    const { noNameClass } = buildFixture();
    const obj = createInstanceOf(noNameClass);
    expect(displayLabel(obj)).toBe('Plain');
  });
});
