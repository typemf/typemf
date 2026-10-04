import { EcorePackageImpl, EClassImpl, EPackageImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { concreteSubtypesOf } from '../instantiable-classes.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const pkg = new EPackageImpl();
  pkg.setName('shapes');
  pkg.setNsURI('https://example.com/shapes');

  const shape = new EClassImpl();
  shape.setName('Shape');
  shape.setAbstract(true);
  pkg.getEClassifiers().add(shape);

  const circle = new EClassImpl();
  circle.setName('Circle');
  circle.getESuperTypes().add(shape);
  pkg.getEClassifiers().add(circle);

  const square = new EClassImpl();
  square.setName('Square');
  square.getESuperTypes().add(shape);
  pkg.getEClassifiers().add(square);

  // A concrete class NOT related to Shape at all - must never show up as one of its subtypes.
  const unrelated = new EClassImpl();
  unrelated.setName('Unrelated');
  pkg.getEClassifiers().add(unrelated);

  // An abstract subtype of Shape - still not instantiable, must be excluded even though it IS a subtype.
  const polygon = new EClassImpl();
  polygon.setName('Polygon');
  polygon.setAbstract(true);
  polygon.getESuperTypes().add(shape);
  pkg.getEClassifiers().add(polygon);

  const pentagon = new EClassImpl();
  pentagon.setName('Pentagon');
  pentagon.getESuperTypes().add(polygon); // a concrete grandchild, two levels down

  pkg.getEClassifiers().add(pentagon);

  return { pkg, shape, circle, square, unrelated, polygon, pentagon };
}

describe('concreteSubtypesOf', () => {
  it('returns every concrete subtype of the given class, excluding unrelated classes', () => {
    const { pkg, shape } = buildFixture();
    const names = concreteSubtypesOf(shape, [pkg])
      .map((c) => c.getName())
      .sort();
    expect(names).toEqual(['Circle', 'Pentagon', 'Square']);
  });

  it('excludes abstract subtypes', () => {
    const { pkg, shape } = buildFixture();
    const names = concreteSubtypesOf(shape, [pkg]).map((c) => c.getName());
    expect(names).not.toContain('Polygon');
  });

  it('includes indirect subtypes', () => {
    const { pkg, shape, pentagon } = buildFixture();
    expect(concreteSubtypesOf(shape, [pkg])).toContain(pentagon);
  });

  it('includes the class itself when it is concrete', () => {
    const { pkg, circle } = buildFixture();
    expect(concreteSubtypesOf(circle, [pkg])).toEqual([circle]);
  });

  it('returns an empty list when the given class has no concrete subtypes at all', () => {
    const { pkg } = buildFixture();
    const leaf = new EClassImpl();
    leaf.setName('Leaf');
    leaf.setAbstract(true);
    pkg.getEClassifiers().add(leaf);
    expect(concreteSubtypesOf(leaf, [pkg])).toEqual([]);
  });
});
