import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EClassImpl,
  EcorePackageImpl,
  EList,
  EPackageImpl,
  EReferenceImpl,
} from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { handleCreateChildRequest } from '../handle-create-child-request.js';
import { ObjectIdMap } from '../object-id-map.js';

void EcorePackageImpl.eINSTANCE;

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
  libraryClass.getEStructuralFeatures().add(booksRef);

  const featuredBookRef = new EReferenceImpl();
  featuredBookRef.setName('featuredBook');
  featuredBookRef.setEType(bookClass);
  featuredBookRef.setContainment(true);
  libraryClass.getEStructuralFeatures().add(featuredBookRef);

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().addAll([libraryClass, bookClass]);
  libraryClass.setEPackage(pkg);
  bookClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  const library = createInstanceOf(libraryClass);
  return { library, bookClass, booksRef, featuredBookRef };
}

describe('handleCreateChildRequest', () => {
  it('creates an instance in a many-valued containment feature', () => {
    const { library, bookClass, booksRef } = buildFixture();
    const objectIds = new ObjectIdMap();
    const parentId = objectIds.idFor(library);
    const featureId = objectIds.idFor(booksRef);
    const classId = objectIds.idFor(bookClass);

    const response = handleCreateChildRequest(
      { type: 'typemf/createChild', requestId: 'r1', parentId, featureId, classId },
      { objectIds }
    );

    expect(response.type).toBe('typemf/createChildResult');
    const list = library.eGet(booksRef) as EList<unknown>;
    expect(list.size()).toBe(1);
    if (response.type === 'typemf/createChildResult') {
      expect(objectIds.objectFor(response.childId)).toBe(list.get(0));
      expect((list.get(0) as { eClass(): unknown }).eClass()).toBe(bookClass);
    }
  });

  it('creates an instance in a single-valued containment feature', () => {
    const { library, bookClass, featuredBookRef } = buildFixture();
    const objectIds = new ObjectIdMap();
    const parentId = objectIds.idFor(library);
    const featureId = objectIds.idFor(featuredBookRef);
    const classId = objectIds.idFor(bookClass);

    const response = handleCreateChildRequest(
      { type: 'typemf/createChild', requestId: 'r2', parentId, featureId, classId },
      { objectIds }
    );

    expect(response.type).toBe('typemf/createChildResult');
    const value = library.eGet(featuredBookRef);
    expect(value).toBeDefined();
    if (response.type === 'typemf/createChildResult') {
      expect(objectIds.objectFor(response.childId)).toBe(value);
    }
  });

  it('inserts at a specific position when given one', () => {
    const { library, bookClass, booksRef } = buildFixture();
    const objectIds = new ObjectIdMap();
    const existing = createInstanceOf(bookClass);
    (library.eGet(booksRef) as EList<unknown>).add(existing);

    const parentId = objectIds.idFor(library);
    const featureId = objectIds.idFor(booksRef);
    const classId = objectIds.idFor(bookClass);
    const response = handleCreateChildRequest(
      { type: 'typemf/createChild', requestId: 'r3', parentId, featureId, classId, position: 0 },
      { objectIds }
    );

    expect(response.type).toBe('typemf/createChildResult');
    const list = library.eGet(booksRef) as EList<unknown>;
    expect(list.size()).toBe(2);
    if (response.type === 'typemf/createChildResult') {
      expect(objectIds.objectFor(response.childId)).toBe(list.get(0)); // inserted at position 0, ahead of the pre-existing book
    }
  });

  it('returns a CreateChildError for an unknown parentId', () => {
    const { bookClass, booksRef } = buildFixture();
    const objectIds = new ObjectIdMap();
    const response = handleCreateChildRequest(
      {
        type: 'typemf/createChild',
        requestId: 'r4',
        parentId: 'not-real',
        featureId: objectIds.idFor(booksRef),
        classId: objectIds.idFor(bookClass),
      },
      { objectIds }
    );
    expect(response.type).toBe('typemf/createChildError');
  });

  it('returns a CreateChildError for a feature that is not a containment reference', () => {
    const { library, bookClass, booksRef } = buildFixture();
    booksRef.setContainment(false); // a non-containment reference now
    const objectIds = new ObjectIdMap();
    const response = handleCreateChildRequest(
      {
        type: 'typemf/createChild',
        requestId: 'r5',
        parentId: objectIds.idFor(library),
        featureId: objectIds.idFor(booksRef),
        classId: objectIds.idFor(bookClass),
      },
      { objectIds }
    );
    expect(response.type).toBe('typemf/createChildError');
  });

  it('returns a CreateChildError for an unknown classId', () => {
    const { library, booksRef } = buildFixture();
    const objectIds = new ObjectIdMap();
    const response = handleCreateChildRequest(
      {
        type: 'typemf/createChild',
        requestId: 'r6',
        parentId: objectIds.idFor(library),
        featureId: objectIds.idFor(booksRef),
        classId: 'not-real',
      },
      { objectIds }
    );
    expect(response.type).toBe('typemf/createChildError');
  });
});
