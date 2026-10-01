import { createInstanceOf, DynamicEFactoryImpl, EClassImpl, EcorePackageImpl, EList, EPackageImpl, EReferenceImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { handleAncestorChainRequest } from '../handle-ancestor-chain-request.js';
import { ObjectIdMap } from '../object-id-map.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const libraryClass = new EClassImpl();
  libraryClass.setName('Library');
  const bookClass = new EClassImpl();
  bookClass.setName('Book');
  const chapterClass = new EClassImpl();
  chapterClass.setName('Chapter');

  const booksRef = new EReferenceImpl();
  booksRef.setName('books');
  booksRef.setEType(bookClass);
  booksRef.setContainment(true);
  booksRef.setUpperBound(-1);
  libraryClass.getEStructuralFeatures().add(booksRef);

  const chaptersRef = new EReferenceImpl();
  chaptersRef.setName('chapters');
  chaptersRef.setEType(chapterClass);
  chaptersRef.setContainment(true);
  chaptersRef.setUpperBound(-1);
  bookClass.getEStructuralFeatures().add(chaptersRef);

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().addAll([libraryClass, bookClass, chapterClass]);
  libraryClass.setEPackage(pkg);
  bookClass.setEPackage(pkg);
  chapterClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  const library = createInstanceOf(libraryClass);
  const book = createInstanceOf(bookClass);
  const chapter = createInstanceOf(chapterClass);
  (library.eGet(booksRef) as EList<unknown>).add(book);
  (book.eGet(chaptersRef) as EList<unknown>).add(chapter);

  return { library, book, chapter };
}

describe('handleAncestorChainRequest', () => {
  it('returns the chain root-first, the requested object\'s own id last, for a nested object', () => {
    const { library, book } = buildFixture();
    const objectIds = new ObjectIdMap();
    const libraryId = objectIds.idFor(library);
    const bookId = objectIds.idFor(book);

    const response = handleAncestorChainRequest({ type: 'typemf/ancestorChain', requestId: 'r1', id: bookId }, { objectIds });

    expect(response.type).toBe('typemf/ancestorChainResult');
    if (response.type === 'typemf/ancestorChainResult') {
      expect(response.chainIds).toEqual([libraryId, bookId]);
    }
  });

  it('returns a lone-element array for the document\'s own root (nothing above it to expand)', () => {
    const { library } = buildFixture();
    const objectIds = new ObjectIdMap();
    const libraryId = objectIds.idFor(library);

    const response = handleAncestorChainRequest({ type: 'typemf/ancestorChain', requestId: 'r2', id: libraryId }, { objectIds });

    expect(response.type).toBe('typemf/ancestorChainResult');
    if (response.type === 'typemf/ancestorChainResult') {
      expect(response.chainIds).toEqual([libraryId]);
    }
  });

  it('returns an AncestorChainError for an unknown id', () => {
    const objectIds = new ObjectIdMap();
    const response = handleAncestorChainRequest({ type: 'typemf/ancestorChain', requestId: 'r3', id: 'not-real' }, { objectIds });
    expect(response.type).toBe('typemf/ancestorChainError');
  });

  it('walks multiple levels correctly, not just one', () => {
    const { library, book, chapter } = buildFixture();
    const objectIds = new ObjectIdMap();
    const libraryId = objectIds.idFor(library);
    const bookId = objectIds.idFor(book);
    const chapterId = objectIds.idFor(chapter);

    const response = handleAncestorChainRequest({ type: 'typemf/ancestorChain', requestId: 'r4', id: chapterId }, { objectIds });
    expect(response.type).toBe('typemf/ancestorChainResult');
    if (response.type === 'typemf/ancestorChainResult') {
      expect(response.chainIds).toEqual([libraryId, bookId, chapterId]);
    }
  });
});
