import { DynamicEFactoryImpl, EClassImpl, EcorePackageImpl, EPackageImpl, EReferenceImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { findTypeCompatibleObjectsInPackage } from '../find-type-compatible-objects.js';
import { ObjectIdMap } from '../object-id-map.js';

function buildFixture() {
  const libraryClass = new EClassImpl();
  libraryClass.setName('Library');
  const bookClass = new EClassImpl();
  bookClass.setName('Book');

  const booksRef = new EReferenceImpl();
  booksRef.setName('books');
  booksRef.setEType(bookClass);
  booksRef.setContainment(true);
  booksRef.setUpperBound(-1);
  booksRef.setFeatureID(0);
  libraryClass.getEStructuralFeatures().add(booksRef);

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().addAll([libraryClass, bookClass]);
  for (const c of [libraryClass, bookClass]) c.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return { pkg, libraryClass, bookClass, booksRef };
}

describe('findTypeCompatibleObjectsInPackage', () => {
  it('finds every classifier of the requested type, walking the package like a resource root', () => {
    const { pkg, libraryClass, bookClass } = buildFixture();
    const objectIds = new ObjectIdMap();

    const candidateIds = findTypeCompatibleObjectsInPackage(pkg, EcorePackageImpl.eINSTANCE.getEClass(), objectIds);

    const resolved = candidateIds.map((id) => objectIds.objectFor(id));
    expect(resolved).toEqual(expect.arrayContaining([libraryClass, bookClass]));
  });

  it('also finds a classifier-owned feature, since it is contained in the package too', () => {
    const { pkg, booksRef } = buildFixture();
    const objectIds = new ObjectIdMap();

    const candidateIds = findTypeCompatibleObjectsInPackage(
      pkg,
      EcorePackageImpl.eINSTANCE.getEReference(),
      objectIds
    );

    expect(candidateIds.map((id) => objectIds.objectFor(id))).toEqual([booksRef]);
  });

  it('returns nothing for a type nothing in the package matches', () => {
    const { pkg } = buildFixture();
    const objectIds = new ObjectIdMap();

    const candidateIds = findTypeCompatibleObjectsInPackage(
      pkg,
      EcorePackageImpl.eINSTANCE.getEAnnotation(),
      objectIds
    );

    expect(candidateIds).toEqual([]);
  });
});
