import { EcorePackageImpl, EClassImpl, EDataTypeImpl, EPackageImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { instantiableClasses } from '../instantiable-classes.js';

// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

function buildPackage(): EPackageImpl {
  const pkg = new EPackageImpl();
  pkg.setName('shapes');
  pkg.setNsURI('https://example.com/shapes');

  const shape = new EClassImpl();
  shape.setName('Shape');
  shape.setAbstract(true);
  pkg.getEClassifiers().add(shape);

  const drawable = new EClassImpl();
  drawable.setName('Drawable');
  drawable.setInterface(true);
  pkg.getEClassifiers().add(drawable);

  const circle = new EClassImpl();
  circle.setName('Circle');
  pkg.getEClassifiers().add(circle);

  const square = new EClassImpl();
  square.setName('Square');
  pkg.getEClassifiers().add(square);

  const someDataType = new EDataTypeImpl();
  someDataType.setName('Color');
  pkg.getEClassifiers().add(someDataType);

  return pkg;
}

describe('instantiableClasses', () => {
  it('excludes abstract and interface classes, and non-EClass classifiers', () => {
    const pkg = buildPackage();
    const names = instantiableClasses([pkg])
      .map((c) => c.getName())
      .sort();
    expect(names).toEqual(['Circle', 'Square']);
  });

  it('returns an empty list for a package with no concrete classes', () => {
    const pkg = new EPackageImpl();
    pkg.setName('empty');
    pkg.setNsURI('https://example.com/empty');
    const shape = new EClassImpl();
    shape.setName('OnlyAbstract');
    shape.setAbstract(true);
    pkg.getEClassifiers().add(shape);

    expect(instantiableClasses([pkg])).toEqual([]);
  });

  it('collects concrete classes across multiple packages', () => {
    const pkg1 = buildPackage();
    const pkg2 = new EPackageImpl();
    pkg2.setName('other');
    pkg2.setNsURI('https://example.com/other');
    const triangle = new EClassImpl();
    triangle.setName('Triangle');
    pkg2.getEClassifiers().add(triangle);

    const names = instantiableClasses([pkg1, pkg2])
      .map((c) => c.getName())
      .sort();
    expect(names).toEqual(['Circle', 'Square', 'Triangle']);
  });
});
