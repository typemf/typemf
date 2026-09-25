import { EObject, ResourceSetImpl, URI, UriConverter } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { registerXmiFormat } from '../xmi-resource-factory.js';
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
  registerXmiFormat(rs.getResourceFactoryRegistry());
  return rs;
}

describe('XmiSerializer', () => {
  it('round-trips attributes and containment, with namespaces declared on the root', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, titleAttr, publishedAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uri = URI.parse('mem:library-a.xmi');
    const resource = rs.createResource(uri);
    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, 'Dune');
    book.eSet(publishedAttr, new Date('1965-08-01T00:00:00.000Z'));
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book);
    resource.getContents().add(library);
    await resource.save();

    const raw = new TextDecoder().decode(await converter.readBinary(uri));
    expect(raw).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(raw).toContain('xmi:version="2.0"');
    expect(raw).toContain('xmlns:xmi="http://www.omg.org/XMI"');
    expect(raw).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
    expect(raw).toContain('xmlns:lib="https://typemf.dev/samples/library"');
    expect(raw).toContain('<lib:Library');
    expect(raw).toContain('title="Dune"');
    expect(raw).toContain('published="1965-08-01T00:00:00.000Z"');
    // No xmi:id anywhere - matches EMF's actual default (fragment-path,
    // non-UUID) behaviour rather than always assigning generated ids.
    expect(raw).not.toContain('xmi:id');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedBook = [...(reloadedLibrary.eGet(booksRef) as Iterable<EObject>)][0]!;
    expect(reloadedBook.eGet(titleAttr)).toBe('Dune');
    expect(reloadedBook.eGet(publishedAttr)).toBeInstanceOf(Date);
    expect((reloadedBook.eGet(publishedAttr) as Date).toISOString()).toBe('1965-08-01T00:00:00.000Z');
  });

  it('serializes a same-document reference to an ID-bearing target as a plain attribute value', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uri = URI.parse('mem:library-a.xmi');
    const resource = rs.createResource(uri);
    const library = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, 'Dune');
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book);
    library.eSet(featuredBookRef, book);
    resource.getContents().add(library);
    await resource.save();

    const raw = new TextDecoder().decode(await converter.readBinary(uri));
    expect(raw).toContain('featuredBook="Dune"');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedBooks = [...(reloadedLibrary.eGet(booksRef) as Iterable<EObject>)];
    expect(reloadedLibrary.eGet(featuredBookRef)).toBe(reloadedBooks[0]);
  });

  it('falls back to the positional "//@feature.index" fragment when the target has no ID', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uri = URI.parse('mem:library-a.xmi');
    const resource = rs.createResource(uri);
    const library = libraryClass.createInstance();
    const untitledBook = bookClass.createInstance();
    (library.eGet(booksRef) as { add(v: EObject): void }).add(untitledBook);
    library.eSet(featuredBookRef, untitledBook);
    resource.getContents().add(library);
    await resource.save();

    const raw = new TextDecoder().decode(await converter.readBinary(uri));
    expect(raw).toContain('featuredBook="//@books.0"');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedBooks = [...(reloadedLibrary.eGet(booksRef) as Iterable<EObject>)];
    expect(reloadedLibrary.eGet(featuredBookRef)).toBe(reloadedBooks[0]);
  });

  it('serializes a cross-document reference as a nested <feature href="..."/> element, and resolves it lazily', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uriA = URI.parse('mem:library-a.xmi');
    const resourceA = rs.createResource(uriA);
    const libraryA = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, 'Dune');
    (libraryA.eGet(booksRef) as { add(v: EObject): void }).add(book);
    resourceA.getContents().add(libraryA);
    await resourceA.save();

    const uriB = URI.parse('mem:library-b.xmi');
    const resourceB = rs.createResource(uriB);
    const libraryB = libraryClass.createInstance();
    libraryB.eSet(featuredBookRef, book);
    resourceB.getContents().add(libraryB);
    await resourceB.save();

    const rawB = new TextDecoder().decode(await converter.readBinary(uriB));
    expect(rawB).toContain('<featuredBook href="mem:library-a.xmi#Dune"/>');
    expect(rawB).not.toContain('featuredBook="'); // not the attribute form

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const loadedB = await freshSet.getResource(uriB, true);
    expect(freshSet.getResources()).toHaveLength(1);

    const featuredBook = loadedB!.getContents().get(0).eGet(featuredBookRef) as EObject;
    expect(featuredBook.eIsProxy()).toBe(true);

    const resolved = await freshSet.resolve(featuredBook);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eGet(titleAttr)).toBe('Dune');
    expect(freshSet.getResources()).toHaveLength(2);
  });

  it('emits xsi:type on the href element for a polymorphic cross-document reference', async () => {
    const { libraryPackage, libraryClass, bookClass, audioBookClass, booksRef, featuredBookRef, titleAttr, narratorAttr } =
      buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uriA = URI.parse('mem:library-a.xmi');
    const resourceA = rs.createResource(uriA);
    const libraryA = libraryClass.createInstance();
    const audioBook = audioBookClass.createInstance();
    audioBook.eSet(titleAttr, 'Dune');
    audioBook.eSet(narratorAttr, 'Simon Vance');
    (libraryA.eGet(booksRef) as { add(v: EObject): void }).add(audioBook);
    resourceA.getContents().add(libraryA);
    await resourceA.save();

    const uriB = URI.parse('mem:library-b.xmi');
    const resourceB = rs.createResource(uriB);
    const libraryB = libraryClass.createInstance();
    libraryB.eSet(featuredBookRef, audioBook);
    resourceB.getContents().add(libraryB);
    await resourceB.save();

    const rawB = new TextDecoder().decode(await converter.readBinary(uriB));
    expect(rawB).toContain('<featuredBook xsi:type="lib:AudioBook" href="mem:library-a.xmi#Dune"/>');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const loadedB = await freshSet.getResource(uriB, true);
    const proxy = loadedB!.getContents().get(0).eGet(featuredBookRef) as EObject;
    expect(proxy.eClass()).toBe(audioBookClass); // correct even before resolving

    const resolved = await freshSet.resolve(proxy);
    expect(resolved.eClass()).toBe(audioBookClass);
    expect(resolved.eGet(narratorAttr)).toBe('Simon Vance');
  });

  it('emits xsi:type on the nested containment element for a polymorphic containment reference', async () => {
    const { libraryPackage, libraryClass, audioBookClass, booksRef, titleAttr, narratorAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    const uri = URI.parse('mem:library-a.xmi');
    const resource = rs.createResource(uri);
    const library = libraryClass.createInstance();
    const audioBook = audioBookClass.createInstance();
    audioBook.eSet(titleAttr, 'Dune');
    audioBook.eSet(narratorAttr, 'Simon Vance');
    (library.eGet(booksRef) as { add(v: EObject): void }).add(audioBook);
    resource.getContents().add(library);
    await resource.save();

    const raw = new TextDecoder().decode(await converter.readBinary(uri));
    expect(raw).toContain('<books xsi:type="lib:AudioBook" title="Dune" narrator="Simon Vance"/>');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedBook = [...(reloaded!.getContents().get(0).eGet(booksRef) as Iterable<EObject>)][0]!;
    expect(reloadedBook.eClass()).toBe(audioBookClass);
    expect(reloadedBook.eGet(narratorAttr)).toBe('Simon Vance');
  });

  it('round-trips a many-valued EAttribute as repeated child elements', async () => {
    const { libraryPackage, bookClass, titleAttr } = buildSampleMetamodel();
    const { EAttributeImpl } = await import('@typemf/core');
    const tagsAttr = new EAttributeImpl();
    tagsAttr.setName('tags');
    tagsAttr.setEType(titleAttr.getEType());
    tagsAttr.setUpperBound(-1);
    tagsAttr.setFeatureID(50);
    tagsAttr.setEContainingClass(bookClass);
    bookClass.getEStructuralFeatures().add(tagsAttr);
    bookClass.recomputeAllLists();

    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);
    const uri = URI.parse('mem:book.xmi');
    const resource = rs.createResource(uri);
    const book = bookClass.createInstance();
    book.eSet(titleAttr, 'Dune');
    (book.eGet(tagsAttr) as { add(v: unknown): void }).add('sci-fi');
    (book.eGet(tagsAttr) as { add(v: unknown): void }).add('classic');
    resource.getContents().add(book);
    await resource.save();

    const raw = new TextDecoder().decode(await converter.readBinary(uri));
    expect(raw).toContain('<tags>sci-fi</tags>');
    expect(raw).toContain('<tags>classic</tags>');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const reloaded = await freshSet.getResource(uri, true);
    const reloadedBook = reloaded!.getContents().get(0);
    expect([...(reloadedBook.eGet(tagsAttr) as Iterable<string>)]).toEqual(['sci-fi', 'classic']);
  });

  it('rejects a multi-root document with a clear error (v1 scope)', async () => {
    const { libraryPackage, libraryClass } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);
    const resource = rs.createResource(URI.parse('mem:two-roots.xmi'));
    resource.getContents().add(libraryClass.createInstance());
    resource.getContents().add(libraryClass.createInstance());
    await expect(resource.save()).rejects.toThrow(/only supports exactly one root/);
  });

  it('resolves a same-document attribute-form reference written WITH a leading "#" (real EMF\'s own convention - our own writer never produces this, so a hand-written raw file is needed to exercise it)', async () => {
    const { libraryPackage, bookClass } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    // Hand-written raw XML - "featuredBook" (a non-containment reference)
    // given the SAME-document fragment form real EMF always writes with a
    // leading "#", which our own writer never produces (so this exercises
    // a code path our own round-trip tests can't reach).
    const raw = `<?xml version="1.0" encoding="UTF-8"?>
<lib:Library xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:lib="https://typemf.dev/samples/library"
    featuredBook="#Dune">
  <books title="Dune"/>
</lib:Library>`;
    await converter.writeBinary(URI.parse('mem:hash-prefixed.xmi'), new TextEncoder().encode(raw));

    const resource = await rs.getResource(URI.parse('mem:hash-prefixed.xmi'), true);
    const library = resource!.getContents().get(0);
    const feature = library.eClass().getEStructuralFeatureByName('featuredBook')!;
    const featured = library.eGet(feature) as EObject;
    expect(featured.eClass()).toBe(bookClass);
    const titleAttr = bookClass.getEStructuralFeatureByName('title')!;
    expect(featured.eGet(titleAttr)).toBe('Dune');
  });
});
