import { EObject, EReferenceImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { computeEmfFragment, resolveEmfFragment } from '../emf-fragment.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('computeEmfFragment / resolveEmfFragment', () => {
  it('addresses the root itself as "/"', () => {
    const { libraryClass } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    expect(computeEmfFragment(library, [library])).toBe('/');
    expect(resolveEmfFragment('/', [library])).toBe(library);
  });

  it('addresses a many-valued containment descendant as "//@feature.index"', () => {
    const { libraryClass, bookClass, booksRef, titleAttr } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    const book0 = bookClass.createInstance();
    book0.eSet(titleAttr, 'Dune');
    const book1 = bookClass.createInstance();
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book0);
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book1);

    // book1 has no ID (title unset), so this exercises the positional path
    // even though book0 (with an ID) would take precedence for itself.
    expect(computeEmfFragment(book1, [library])).toBe('//@books.1');
    expect(resolveEmfFragment('//@books.1', [library])).toBe(book1);
  });

  it('addresses a single-valued containment descendant as "//@feature" with no index', () => {
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
    const untitledBook = bookClass.createInstance();
    library.eSet(coverRef, untitledBook);

    expect(computeEmfFragment(untitledBook, [library])).toBe('//@cover');
    expect(resolveEmfFragment('//@cover', [library])).toBe(untitledBook);
  });

  it('prefers the ID attribute over a positional path when one is set', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, 'Dune');
    expect(computeEmfFragment(book, [book])).toBe('Dune');
    expect(resolveEmfFragment('Dune', [book])).toBe(book);
  });

  it('resolveEmfFragment returns undefined for a malformed or non-matching fragment', () => {
    const { libraryClass } = buildSampleMetamodel();
    const library = libraryClass.createInstance();
    expect(resolveEmfFragment('//@notAFeature', [library])).toBeUndefined();
    expect(resolveEmfFragment('//@books.5', [library])).toBeUndefined();
    expect(resolveEmfFragment('not-a-fragment-and-no-such-id', [library])).toBeUndefined();
  });

  it('computeEmfFragment throws when the target is unreachable from the given roots', () => {
    const { bookClass } = buildSampleMetamodel();
    const orphan = bookClass.createInstance();
    expect(() => computeEmfFragment(orphan, [])).toThrow(/not reachable/);
  });
});
