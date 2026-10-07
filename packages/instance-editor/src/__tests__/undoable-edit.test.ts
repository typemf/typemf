import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EAttributeImpl,
  EcorePackageImpl,
  EClassImpl,
  EDataTypeImpl,
  EList,
  EObject,
  EPackageImpl,
  EReferenceImpl,
} from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { handleApplyEditRequest } from '../handle-apply-edit-request.js';
import { handleCreateChildRequest } from '../handle-create-child-request.js';
import { ObjectIdMap } from '../object-id-map.js';
import { applyAsUndoableEdit, UndoableEdit } from '../undoable-edit.js';

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
  const featuredRef = new EReferenceImpl();
  featuredRef.setName('featured');
  featuredRef.setEType(bookClass);
  featuredRef.setContainment(true);
  featuredRef.setFeatureID(1);
  libraryClass.getEStructuralFeatures().add(featuredRef);

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().addAll([bookClass, libraryClass]);
  bookClass.setEPackage(pkg);
  libraryClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  const library = createInstanceOf(libraryClass);
  const books = library.eGet(booksRef) as EList<EObject>;
  return { bookClass, libraryClass, titleAttr, booksRef, featuredRef, library, books };
}

describe('applyAsUndoableEdit', () => {
  it('undoes and redoes a single-valued SET, restoring "unset" rather than a default', () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);

    const edit = applyAsUndoableEdit(book, titleAttr, 'Set title', () => book.eSet(titleAttr, 'Dune'));
    expect(book.eGet(titleAttr)).toBe('Dune');

    edit.undo();
    expect(book.eIsSet(titleAttr)).toBe(false);
    edit.redo();
    expect(book.eGet(titleAttr)).toBe('Dune');
  });

  it('undoes an UNSET back to the previous value', () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');

    const edit = applyAsUndoableEdit(book, titleAttr, 'Unset title', () => book.eUnset(titleAttr));
    expect(book.eIsSet(titleAttr)).toBe(false);

    edit.undo();
    expect(book.eGet(titleAttr)).toBe('Dune');
  });

  it('undoes a list REMOVE to the original position', () => {
    const { bookClass, booksRef, library, books } = buildFixture();
    const [a, b, c] = [createInstanceOf(bookClass), createInstanceOf(bookClass), createInstanceOf(bookClass)];
    books.addAll([a, b, c]);

    const edit = applyAsUndoableEdit(library, booksRef, 'Remove', () => books.remove(b));
    expect(books.toArray()).toEqual([a, c]);
    expect(b.eContainer()).toBeUndefined();

    edit.undo();
    expect(books.toArray()).toEqual([a, b, c]);
    expect(b.eContainer()).toBe(library);
  });

  it('propagates an error from apply and records nothing', () => {
    const { bookClass, titleAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    expect(() =>
      applyAsUndoableEdit(book, titleAttr, 'x', () => {
        throw new Error('boom');
      })
    ).toThrow('boom');
  });
});

describe('edit handlers report an undoable edit', () => {
  it('handleApplyEditRequest: undo and redo of an ADD', () => {
    const { bookClass, booksRef, library, books } = buildFixture();
    const objectIds = new ObjectIdMap();
    const book = createInstanceOf(bookClass);
    let edit: UndoableEdit | undefined;

    const response = handleApplyEditRequest(
      {
        type: 'typemf/applyEdit',
        requestId: 'r',
        objectId: objectIds.idFor(library),
        featureId: objectIds.idFor(booksRef),
        eventType: 'ADD',
        value: { ref: objectIds.idFor(book) },
      },
      { objectIds },
      (e) => (edit = e)
    );

    expect(response.type).toBe('typemf/applyEditResult');
    expect(books.toArray()).toEqual([book]);
    edit!.undo();
    expect(books.toArray()).toEqual([]);
    edit!.redo();
    expect(books.toArray()).toEqual([book]);
  });

  it('handleApplyEditRequest: reports nothing for a failed edit', () => {
    const { library } = buildFixture();
    const objectIds = new ObjectIdMap();
    let called = false;
    const response = handleApplyEditRequest(
      {
        type: 'typemf/applyEdit',
        requestId: 'r',
        objectId: objectIds.idFor(library),
        featureId: 'unknown',
        eventType: 'UNSET',
      },
      { objectIds },
      () => (called = true)
    );
    expect(response.type).toBe('typemf/applyEditError');
    expect(called).toBe(false);
  });

  it('handleCreateChildRequest: undo removes the new child, redo adds the same child back', () => {
    const { bookClass, booksRef, library, books } = buildFixture();
    const objectIds = new ObjectIdMap();
    let edit: UndoableEdit | undefined;

    handleCreateChildRequest(
      {
        type: 'typemf/createChild',
        requestId: 'r',
        parentId: objectIds.idFor(library),
        featureId: objectIds.idFor(booksRef),
        classId: objectIds.idFor(bookClass),
      },
      { objectIds },
      (e) => (edit = e)
    );
    const child = books.get(0);

    edit!.undo();
    expect(books.size()).toBe(0);
    edit!.redo();
    expect(books.get(0)).toBe(child);
  });

  it('handleCreateChildRequest: undo restores the child a single-valued containment replaced', () => {
    const { bookClass, featuredRef, library } = buildFixture();
    const objectIds = new ObjectIdMap();
    const original = createInstanceOf(bookClass);
    library.eSet(featuredRef, original);
    let edit: UndoableEdit | undefined;

    handleCreateChildRequest(
      {
        type: 'typemf/createChild',
        requestId: 'r',
        parentId: objectIds.idFor(library),
        featureId: objectIds.idFor(featuredRef),
        classId: objectIds.idFor(bookClass),
      },
      { objectIds },
      (e) => (edit = e)
    );
    expect(library.eGet(featuredRef)).not.toBe(original);

    edit!.undo();
    expect(library.eGet(featuredRef)).toBe(original);
  });
});
