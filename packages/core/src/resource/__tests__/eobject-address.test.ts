import { describe, expect, it } from 'vitest';
import { EObject } from '../../metamodel/api/eobject.js';
import { EReferenceImpl } from '../../metamodel/impl/ereference-impl.js';
import { buildSampleMetamodel } from '../../metamodel/__tests__/sample-metamodel.js';
import { computeFragment, resolveFragment } from '../eobject-address.js';

describe('computeFragment / resolveFragment', () => {
  it('prefers the ID-attribute form when the target has an ID set', () => {
    const { libraryClass, bookClass, booksRef, titleAttr } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, 'Dune');
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book);

    const roots = [library];
    expect(computeFragment(book, roots)).toBe('Book_Dune');
    expect(resolveFragment('Book_Dune', roots)).toBe(book);
  });

  it('falls back to a positional path when there is no ID set', () => {
    const { libraryClass, bookClass, booksRef } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    const untitled = bookClass.createInstance();
    (library.eGet(booksRef) as { add(v: EObject): void }).add(untitled);

    const roots = [library];
    expect(computeFragment(untitled, roots)).toBe('/0/books/0');
    expect(resolveFragment('/0/books/0', roots)).toBe(untitled);
  });

  it('resolves a positional path through a single-valued containment feature', () => {
    const { libraryClass, bookClass, titleAttr } = buildSampleMetamodel();
    const coverRef = new EReferenceImpl();
    coverRef.setName('cover');
    coverRef.setEType(bookClass);
    coverRef.setContainment(true);
    coverRef.setUpperBound(1);
    coverRef.setFeatureID(99);
    coverRef.setEContainingClass(libraryClass);
    libraryClass.getEStructuralFeatures().add(coverRef);
    libraryClass.recomputeAllLists();

    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, 'Dune');
    library.eSet(coverRef, book);

    const roots = [library];
    expect(computeFragment(book, roots)).toBe('Book_Dune'); // has an ID -> still prefers it
  });

  it('resolveFragment returns undefined (not throw) for an unknown ID', () => {
    const { libraryClass } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    expect(resolveFragment('Book_DoesNotExist', [library])).toBeUndefined();
  });

  it('resolveFragment throws for a malformed positional path', () => {
    const { libraryClass } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    expect(() => resolveFragment('/0/notAFeature', [library])).toThrow(/no feature 'notAFeature'/);
  });

  it('computeFragment throws when the target is unreachable from the given roots', () => {
    const { bookClass } = buildSampleMetamodel();
    const orphan = bookClass.createInstance();
    expect(() => computeFragment(orphan, [])).toThrow(/not reachable/);
  });
});
