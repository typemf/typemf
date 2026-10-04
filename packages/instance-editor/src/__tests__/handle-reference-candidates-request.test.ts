import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EClassImpl,
  EcorePackageImpl,
  EList,
  EObject,
  EObjectSerializer,
  EPackageImpl,
  EReferenceImpl,
  ResourceImpl,
  URI,
} from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { handleReferenceCandidatesRequest } from '../handle-reference-candidates-request.js';
import { ObjectIdMap } from '../object-id-map.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const libraryClass = new EClassImpl();
  libraryClass.setName('Library');
  const bookClass = new EClassImpl();
  bookClass.setName('Book');
  const audioBookClass = new EClassImpl();
  audioBookClass.setName('AudioBook');
  audioBookClass.getESuperTypes().add(bookClass);
  const authorClass = new EClassImpl();
  authorClass.setName('Author');

  const booksRef = new EReferenceImpl();
  booksRef.setName('books');
  booksRef.setEType(bookClass);
  booksRef.setContainment(true);
  booksRef.setUpperBound(-1);
  booksRef.setFeatureID(0);
  libraryClass.getEStructuralFeatures().add(booksRef);

  const authorsRef = new EReferenceImpl();
  authorsRef.setName('authors');
  authorsRef.setEType(authorClass);
  authorsRef.setContainment(true);
  authorsRef.setUpperBound(-1);
  authorsRef.setFeatureID(1);
  libraryClass.getEStructuralFeatures().add(authorsRef);

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().addAll([libraryClass, bookClass, audioBookClass, authorClass]);
  for (const c of [libraryClass, bookClass, audioBookClass, authorClass]) c.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  const library = createInstanceOf(libraryClass);
  const book = createInstanceOf(bookClass);
  const audioBook = createInstanceOf(audioBookClass);
  const author = createInstanceOf(authorClass);
  (library.eGet(booksRef) as EList<unknown>).add(book);
  (library.eGet(booksRef) as EList<unknown>).add(audioBook);
  (library.eGet(authorsRef) as EList<unknown>).add(author);

  // The serializer is never called.
  const fakeSerializer: EObjectSerializer = {
    serialize: async () => new Uint8Array(),
    deserialize: async () => [] as EObject[],
    peekReferencedNsURIs: async () => [],
  };
  const resource = new ResourceImpl(URI.parse('mem:test.bin'), fakeSerializer);
  resource.getContents().add(library);

  return { bookClass, authorClass, library, book, audioBook, author, resource };
}

describe('handleReferenceCandidatesRequest', () => {
  it('finds every object of the requested type and its subtypes', () => {
    const { bookClass, book, audioBook, resource } = buildFixture();
    const objectIds = new ObjectIdMap();
    const typeId = objectIds.idFor(bookClass);

    const response = handleReferenceCandidatesRequest(
      { type: 'typemf/referenceCandidates', requestId: 'r1', typeId },
      { objectIds, resource }
    );

    expect(response.type).toBe('typemf/referenceCandidatesResult');
    if (response.type === 'typemf/referenceCandidatesResult') {
      const resolved = response.candidateIds.map((id) => objectIds.objectFor(id));
      expect(resolved).toEqual(expect.arrayContaining([book, audioBook]));
      expect(resolved).toHaveLength(2); // not the author, and not the library itself
    }
  });

  it('does not include objects of an unrelated type', () => {
    const { authorClass, author, resource } = buildFixture();
    const objectIds = new ObjectIdMap();
    const typeId = objectIds.idFor(authorClass);

    const response = handleReferenceCandidatesRequest(
      { type: 'typemf/referenceCandidates', requestId: 'r2', typeId },
      { objectIds, resource }
    );

    expect(response.type).toBe('typemf/referenceCandidatesResult');
    if (response.type === 'typemf/referenceCandidatesResult') {
      expect(response.candidateIds.map((id) => objectIds.objectFor(id))).toEqual([author]);
    }
  });

  it('includes the root when its type matches', () => {
    const { library, resource } = buildFixture();
    const objectIds = new ObjectIdMap();
    const typeId = objectIds.idFor(library.eClass());

    const response = handleReferenceCandidatesRequest(
      { type: 'typemf/referenceCandidates', requestId: 'r3', typeId },
      { objectIds, resource }
    );

    expect(response.type).toBe('typemf/referenceCandidatesResult');
    if (response.type === 'typemf/referenceCandidatesResult') {
      expect(response.candidateIds.map((id) => objectIds.objectFor(id))).toEqual([library]);
    }
  });

  it('returns a ReferenceCandidatesError for an unknown typeId', () => {
    const { resource } = buildFixture();
    const objectIds = new ObjectIdMap();
    const response = handleReferenceCandidatesRequest(
      { type: 'typemf/referenceCandidates', requestId: 'r4', typeId: 'not-real' },
      { objectIds, resource }
    );
    expect(response.type).toBe('typemf/referenceCandidatesError');
  });
});
