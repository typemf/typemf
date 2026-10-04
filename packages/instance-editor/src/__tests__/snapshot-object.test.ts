import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EAttributeImpl,
  EcorePackageImpl,
  EClassImpl,
  EDataTypeImpl,
  EPackageImpl,
  EReferenceImpl,
} from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { ObjectIdMap } from '../object-id-map.js';
import { snapshotObject } from '../snapshot-object.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');
  const eInt = new EDataTypeImpl();
  eInt.setName('EInt');

  const bookClass = new EClassImpl();
  bookClass.setName('Book');
  const titleAttr = new EAttributeImpl();
  titleAttr.setName('title');
  titleAttr.setEType(eString);
  titleAttr.setFeatureID(0);
  bookClass.getEStructuralFeatures().add(titleAttr);
  const pageCountAttr = new EAttributeImpl();
  pageCountAttr.setName('pageCount');
  pageCountAttr.setEType(eInt);
  pageCountAttr.setFeatureID(1);
  bookClass.getEStructuralFeatures().add(pageCountAttr);

  const libraryClass = new EClassImpl();
  libraryClass.setName('Library');
  const booksRef = new EReferenceImpl();
  booksRef.setName('books');
  booksRef.setEType(bookClass);
  booksRef.setContainment(true);
  booksRef.setUpperBound(-1);
  booksRef.setFeatureID(0);
  libraryClass.getEStructuralFeatures().add(booksRef);
  const featuredBookRef = new EReferenceImpl();
  featuredBookRef.setName('featuredBook');
  featuredBookRef.setEType(bookClass);
  featuredBookRef.setFeatureID(1);
  libraryClass.getEStructuralFeatures().add(featuredBookRef);

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().add(bookClass);
  pkg.getEClassifiers().add(libraryClass);
  // Adding a classifier to eClassifiers doesn't set its package.
  bookClass.setEPackage(pkg);
  libraryClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return { bookClass, libraryClass, titleAttr, pageCountAttr, booksRef, featuredBookRef };
}

describe('snapshotObject', () => {
  it("encodes single-valued attributes with @typemf/json's encoding", () => {
    const { bookClass, titleAttr, pageCountAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    book.eSet(pageCountAttr, 412);

    const snapshot = snapshotObject(book, new ObjectIdMap());

    expect(snapshot.attributes.title).toBe('Dune');
    expect(snapshot.attributes.pageCount).toBe(412);
  });

  it('encodes references as ids, also for containment', () => {
    const { libraryClass, booksRef, bookClass, titleAttr } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (library.eGet(booksRef) as { add(v: unknown): void }).add(book);

    const ids = new ObjectIdMap();
    const snapshot = snapshotObject(library, ids);

    expect(snapshot.references.books).toEqual([ids.idFor(book)]);
    expect(JSON.stringify(snapshot)).not.toContain('DynamicEObjectImpl');
  });

  it('encodes a single-valued reference as an id, or undefined when unset', () => {
    const { libraryClass, featuredBookRef, bookClass, titleAttr } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');

    const ids = new ObjectIdMap();
    expect(snapshotObject(library, ids).references.featuredBook).toBeUndefined();

    library.eSet(featuredBookRef, book);
    expect(snapshotObject(library, ids).references.featuredBook).toBe(ids.idFor(book));
  });

  it('keeps id and eClassId stable across snapshots', () => {
    const { bookClass } = buildFixture();
    const book = createInstanceOf(bookClass);
    const ids = new ObjectIdMap();

    const first = snapshotObject(book, ids);
    const second = snapshotObject(book, ids);

    expect(second.id).toBe(first.id);
    expect(second.eClassId).toBe(first.eClassId);
  });

  it('eClassId resolves to the EClass through the ObjectIdMap', () => {
    const { bookClass } = buildFixture();
    const book = createInstanceOf(bookClass);
    const ids = new ObjectIdMap();

    const snapshot = snapshotObject(book, ids);

    expect(ids.objectFor(snapshot.eClassId)).toBe(bookClass);
  });

  it('many-valued attributes encode each item', () => {
    const { bookClass } = buildFixture();
    const eString = new EDataTypeImpl();
    eString.setName('EString');
    const tagsAttr = new EAttributeImpl();
    tagsAttr.setName('tags');
    tagsAttr.setEType(eString);
    tagsAttr.setUpperBound(-1);
    tagsAttr.setFeatureID(2);
    bookClass.getEStructuralFeatures().add(tagsAttr);

    const book = createInstanceOf(bookClass);
    (book.eGet(tagsAttr) as { add(v: unknown): void }).add('sci-fi');
    (book.eGet(tagsAttr) as { add(v: unknown): void }).add('classic');

    const snapshot = snapshotObject(book, new ObjectIdMap());
    expect(snapshot.attributes.tags).toEqual(['sci-fi', 'classic']);
  });
});
