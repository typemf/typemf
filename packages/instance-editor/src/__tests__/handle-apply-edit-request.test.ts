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
import { ApplyEditRequest } from '../host-message-protocol.js';
import { handleApplyEditRequest } from '../handle-apply-edit-request.js';
import { ObjectIdMap } from '../object-id-map.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');

  const bookClass = new EClassImpl();
  bookClass.setName('Book');
  const titleAttr = new EAttributeImpl();
  titleAttr.setName('title');
  titleAttr.setEType(eString);
  titleAttr.setFeatureID(0);
  bookClass.getEStructuralFeatures().add(titleAttr);

  const libraryClass = new EClassImpl();
  libraryClass.setName('Library');
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
  pkg.getEClassifiers().add(bookClass);
  pkg.getEClassifiers().add(libraryClass);
  bookClass.setEPackage(pkg);
  libraryClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return { bookClass, libraryClass, titleAttr, booksRef };
}

describe('handleApplyEditRequest', () => {
  it('SET applies a primitive value', () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    const objectIds = new ObjectIdMap();
    const objectId = objectIds.idFor(book);
    const featureId = objectIds.idFor(titleAttr);

    const request: ApplyEditRequest = {
      type: 'typemf/applyEdit',
      requestId: 'r1',
      objectId,
      featureId,
      eventType: 'SET',
      value: { primitive: 'Dune' },
    };
    const response = handleApplyEditRequest(request, { objectIds });

    expect(response.type).toBe('typemf/applyEditResult');
    expect(book.eGet(titleAttr)).toBe('Dune');
  });

  it('UNSET clears a previously-set value', () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    const objectIds = new ObjectIdMap();
    const objectId = objectIds.idFor(book);
    const featureId = objectIds.idFor(titleAttr);

    const request: ApplyEditRequest = {
      type: 'typemf/applyEdit',
      requestId: 'r2',
      objectId,
      featureId,
      eventType: 'UNSET',
    };
    handleApplyEditRequest(request, { objectIds });

    expect(book.eIsSet(titleAttr)).toBe(false);
  });

  it('ADD appends a referenced object to a many-valued feature', () => {
    const { libraryClass, booksRef, bookClass } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    const objectIds = new ObjectIdMap();
    const libraryId = objectIds.idFor(library);
    const featureId = objectIds.idFor(booksRef);
    const bookId = objectIds.idFor(book);

    const request: ApplyEditRequest = {
      type: 'typemf/applyEdit',
      requestId: 'r3',
      objectId: libraryId,
      featureId,
      eventType: 'ADD',
      value: { ref: bookId },
    };
    handleApplyEditRequest(request, { objectIds });

    expect([...(library.eGet(booksRef) as Iterable<unknown>)]).toEqual([book]);
  });

  it('ADD with a position inserts at that index', () => {
    const { libraryClass, booksRef, bookClass } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const book1 = createInstanceOf(bookClass);
    const book2 = createInstanceOf(bookClass);
    const book3 = createInstanceOf(bookClass);
    (library.eGet(booksRef) as { add(v: unknown): void }).add(book1);
    (library.eGet(booksRef) as { add(v: unknown): void }).add(book3);
    const objectIds = new ObjectIdMap();
    const libraryId = objectIds.idFor(library);
    const featureId = objectIds.idFor(booksRef);
    const book2Id = objectIds.idFor(book2);

    const request: ApplyEditRequest = {
      type: 'typemf/applyEdit',
      requestId: 'r4',
      objectId: libraryId,
      featureId,
      eventType: 'ADD',
      value: { ref: book2Id },
      position: 1,
    };
    handleApplyEditRequest(request, { objectIds });

    expect([...(library.eGet(booksRef) as Iterable<unknown>)]).toEqual([book1, book2, book3]);
  });

  it('REMOVE removes a referenced object from a many-valued feature', () => {
    const { libraryClass, booksRef, bookClass } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const book1 = createInstanceOf(bookClass);
    const book2 = createInstanceOf(bookClass);
    (library.eGet(booksRef) as { add(v: unknown): void }).add(book1);
    (library.eGet(booksRef) as { add(v: unknown): void }).add(book2);
    const objectIds = new ObjectIdMap();
    const libraryId = objectIds.idFor(library);
    const featureId = objectIds.idFor(booksRef);
    const book1Id = objectIds.idFor(book1);

    const request: ApplyEditRequest = {
      type: 'typemf/applyEdit',
      requestId: 'r5',
      objectId: libraryId,
      featureId,
      eventType: 'REMOVE',
      value: { ref: book1Id },
    };
    handleApplyEditRequest(request, { objectIds });

    expect([...(library.eGet(booksRef) as Iterable<unknown>)]).toEqual([book2]);
  });

  it('returns an ApplyEditError for an unknown objectId', () => {
    const objectIds = new ObjectIdMap();
    const request: ApplyEditRequest = {
      type: 'typemf/applyEdit',
      requestId: 'r6',
      objectId: 'not-real',
      featureId: 'also-not-real',
      eventType: 'UNSET',
    };
    const response = handleApplyEditRequest(request, { objectIds });
    expect(response.type).toBe('typemf/applyEditError');
  });

  it('returns an ApplyEditError for an unknown featureId', () => {
    const { bookClass } = buildFixture();
    const book = createInstanceOf(bookClass);
    const objectIds = new ObjectIdMap();
    const objectId = objectIds.idFor(book);
    const request: ApplyEditRequest = {
      type: 'typemf/applyEdit',
      requestId: 'r7',
      objectId,
      featureId: 'not-real',
      eventType: 'UNSET',
    };
    const response = handleApplyEditRequest(request, { objectIds });
    expect(response.type).toBe('typemf/applyEditError');
  });

  it('returns an ApplyEditError for an unknown referenced id', () => {
    const { bookClass, titleAttr, libraryClass, booksRef } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const objectIds = new ObjectIdMap();
    const libraryId = objectIds.idFor(library);
    const featureId = objectIds.idFor(booksRef);
    void bookClass;
    void titleAttr;

    const request: ApplyEditRequest = {
      type: 'typemf/applyEdit',
      requestId: 'r8',
      objectId: libraryId,
      featureId,
      eventType: 'ADD',
      value: { ref: 'never-existed' },
    };
    const response = handleApplyEditRequest(request, { objectIds });
    expect(response.type).toBe('typemf/applyEditError');
  });
});
