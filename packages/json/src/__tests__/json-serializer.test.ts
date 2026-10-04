import { createInstanceOf, EObject, ResourceSetImpl, URI, UriConverter } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { registerJsonFormat } from '../json-resource-factory.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

class InMemoryUriConverter implements UriConverter {
  private readonly store = new Map<string, Uint8Array>();

  canHandle(uri: URI): boolean {
    return uri.getScheme() === 'mem';
  }

  async readBinary(uri: URI): Promise<Uint8Array> {
    const content = this.store.get(uri.trimFragment().toString());
    if (!content) throw new Error(`No content stored for '${uri.toString()}'.`);
    return content;
  }

  async writeBinary(uri: URI, content: Uint8Array): Promise<void> {
    this.store.set(uri.trimFragment().toString(), content);
  }

  async exists(uri: URI): Promise<boolean> {
    return this.store.has(uri.trimFragment().toString());
  }
}

function newResourceSet(converter: UriConverter): ResourceSetImpl {
  const rs = new ResourceSetImpl();
  rs.getUriConverterRegistry().register(converter);
  registerJsonFormat(rs.getResourceFactoryRegistry());
  return rs;
}

describe('JsonSerializer', () => {
  it('round-trips attributes and containment and writes $namespaces and $roots', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, titleAttr, publishedAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uri = URI.parse('mem:library-a.json');
    const resource = rs.createResource(uri);
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    book.eSet(publishedAttr, new Date('1965-08-01T00:00:00.000Z'));
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book);
    resource.getContents().add(library);

    await resource.save();

    const raw = JSON.parse(new TextDecoder().decode(await converter.readBinary(uri)));
    expect(raw.$namespaces).toEqual({ lib: 'https://typemf.dev/samples/library' });
    expect(raw.$roots[0].$eClass).toEqual({ namespace: 'lib', name: 'Library' });
    expect(raw.$roots[0].books[0].title).toBe('Dune');
    expect(raw.$roots[0].books[0].published).toBe('1965-08-01T00:00:00.000Z'); // ISO string, not a Date

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedBook = (reloadedLibrary.eGet(booksRef) as Iterable<EObject>)[Symbol.iterator]().next()
      .value as EObject;
    expect(reloadedBook.eGet(titleAttr)).toBe('Dune');
    expect(reloadedBook.eGet(publishedAttr)).toBeInstanceOf(Date);
    expect((reloadedBook.eGet(publishedAttr) as Date).toISOString()).toBe('1965-08-01T00:00:00.000Z');
  });

  it('serializes a same-resource non-containment reference by ID as "#fullId"', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uri = URI.parse('mem:library-a.json');
    const resource = rs.createResource(uri);
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book);
    library.eSet(featuredBookRef, book);
    resource.getContents().add(library);

    await resource.save();
    const raw = JSON.parse(new TextDecoder().decode(await converter.readBinary(uri)));
    expect(raw.$roots[0].featuredBook).toEqual({ $ref: '#Book_Dune' });

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedBooks = [...(reloadedLibrary.eGet(booksRef) as Iterable<EObject>)];
    const reloadedFeatured = reloadedLibrary.eGet(featuredBookRef) as EObject;
    expect(reloadedFeatured).toBe(reloadedBooks[0]); // same object identity, not a copy
  });

  it('falls back to a positional path when the target has no ID', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uri = URI.parse('mem:library-a.json');
    const resource = rs.createResource(uri);
    const library = createInstanceOf(libraryClass);
    const untitledBook = createInstanceOf(bookClass); // no title -> no ID set
    (library.eGet(booksRef) as { add(v: EObject): void }).add(untitledBook);
    library.eSet(featuredBookRef, untitledBook);
    resource.getContents().add(library);

    await resource.save();
    const raw = JSON.parse(new TextDecoder().decode(await converter.readBinary(uri)));
    expect(raw.$roots[0].featuredBook).toEqual({ $ref: '#/0/books/0' });

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedBooks = [...(reloadedLibrary.eGet(booksRef) as Iterable<EObject>)];
    expect(reloadedLibrary.eGet(featuredBookRef)).toBe(reloadedBooks[0]);
  });

  it('creates a cross-resource proxy and resolves it lazily, also before the target is loaded', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uriA = URI.parse('mem:library-a.json');
    const resourceA = rs.createResource(uriA);
    const libraryA = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (libraryA.eGet(booksRef) as { add(v: EObject): void }).add(book);
    resourceA.getContents().add(libraryA);
    await resourceA.save();

    const uriB = URI.parse('mem:library-b.json');
    const resourceB = rs.createResource(uriB);
    const libraryB = createInstanceOf(libraryClass);
    libraryB.eSet(featuredBookRef, book);
    resourceB.getContents().add(libraryB);
    await resourceB.save();

    const raw = JSON.parse(new TextDecoder().decode(await converter.readBinary(uriB)));
    expect(raw.$roots[0].featuredBook.$ref).toBe('mem:library-a.json#Book_Dune');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const loadedB = await freshSet.getResource(uriB, true);
    expect(freshSet.getResources()).toHaveLength(1); // A not loaded yet

    const loadedLibraryB = loadedB!.getContents().get(0);
    const featuredBook = loadedLibraryB.eGet(featuredBookRef) as EObject;
    expect(featuredBook.eIsProxy()).toBe(true);

    const resolved = await freshSet.resolve(featuredBook);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eGet(titleAttr)).toBe('Dune');
    expect(freshSet.getResources()).toHaveLength(2);
  });

  it("writes $eClass on a $ref only when the target's type differs from the feature type", async () => {
    const { libraryPackage, libraryClass, audioBookClass, booksRef, featuredBookRef, titleAttr, narratorAttr } =
      buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uriA = URI.parse('mem:library-a.json');
    const resourceA = rs.createResource(uriA);
    const libraryA = createInstanceOf(libraryClass);
    const audioBook = createInstanceOf(audioBookClass);
    audioBook.eSet(titleAttr, 'Dune');
    audioBook.eSet(narratorAttr, 'Simon Vance');
    (libraryA.eGet(booksRef) as { add(v: EObject): void }).add(audioBook);
    resourceA.getContents().add(libraryA);
    await resourceA.save();

    const uriB = URI.parse('mem:library-b.json');
    const resourceB = rs.createResource(uriB);
    const libraryB = createInstanceOf(libraryClass);
    // featuredBookRef's declared type is Book; the actual target is an AudioBook.
    libraryB.eSet(featuredBookRef, audioBook);
    resourceB.getContents().add(libraryB);
    await resourceB.save();

    const raw = JSON.parse(new TextDecoder().decode(await converter.readBinary(uriB)));
    expect(raw.$roots[0].featuredBook.$eClass).toEqual({ namespace: 'lib', name: 'AudioBook' });

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const loadedB = await freshSet.getResource(uriB, true);
    const proxy = loadedB!.getContents().get(0).eGet(featuredBookRef) as EObject;
    // The proxy already has the target's class.
    expect(proxy.eClass()).toBe(audioBookClass);

    const resolved = await freshSet.resolve(proxy);
    expect(resolved.eClass()).toBe(audioBookClass);
    expect(resolved.eGet(narratorAttr)).toBe('Simon Vance');
  });

  it('round-trips a many-valued non-containment reference as an array of $ref objects', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, titleAttr } = buildSampleMetamodel();
    const { EReferenceImpl } = await import('@typemf/core');
    const relatedRef = new EReferenceImpl();
    relatedRef.setName('relatedBooks');
    relatedRef.setEType(bookClass);
    relatedRef.setContainment(false);
    relatedRef.setUpperBound(-1);
    relatedRef.setFeatureID(2);
    relatedRef.setEContainingClass(libraryClass);
    libraryClass.getEStructuralFeatures().add(relatedRef);

    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);
    const uri = URI.parse('mem:library-a.json');
    const resource = rs.createResource(uri);

    const library = createInstanceOf(libraryClass);
    const book1 = createInstanceOf(bookClass);
    book1.eSet(titleAttr, 'Dune');
    const book2 = createInstanceOf(bookClass);
    book2.eSet(titleAttr, 'Foundation');
    const books = library.eGet(booksRef) as { add(v: EObject): void };
    books.add(book1);
    books.add(book2);
    (library.eGet(relatedRef) as { add(v: EObject): void }).add(book1);
    (library.eGet(relatedRef) as { add(v: EObject): void }).add(book2);
    resource.getContents().add(library);

    await resource.save();
    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedRelated = [...(reloadedLibrary.eGet(relatedRef) as Iterable<EObject>)];
    const reloadedBooks = [...(reloadedLibrary.eGet(booksRef) as Iterable<EObject>)];
    expect(reloadedRelated).toEqual(reloadedBooks);
  });
});
