import { createInstanceOf, EObject, ResourceSetImpl, URI, UriConverter } from '@typemf/core';
import { registerJsonFormat } from '@typemf/json';
import { describe, expect, it } from 'vitest';
import { registerXmiFormat } from '../xmi-resource-factory.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

/**
 * A reference into a document of another format uses the fragment syntax of
 * the target's format. The tests check the written bytes and resolve the
 * reference from a fresh ResourceSet.
 */

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
  registerXmiFormat(rs.getResourceFactoryRegistry());
  return rs;
}

describe('Cross-format references (JSON <-> XMI)', () => {
  it('a JSON document references an object in an XMI document', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    // The Book lives in an XMI document.
    const xmiUri = URI.parse('mem:library.xmi');
    const xmiResource = rs.createResource(xmiUri);
    const xmiLibrary = createInstanceOf(libraryClass);
    const untitledBook = createInstanceOf(bookClass); // no ID -> exercises EMF's positional grammar specifically
    (xmiLibrary.eGet(booksRef) as { add(v: EObject): void }).add(untitledBook);
    xmiResource.getContents().add(xmiLibrary);
    await xmiResource.save();

    // A JSON document references it.
    const jsonUri = URI.parse('mem:refs.json');
    const jsonResource = rs.createResource(jsonUri);
    const jsonLibrary = createInstanceOf(libraryClass);
    jsonLibrary.eSet(featuredBookRef, untitledBook);
    jsonResource.getContents().add(jsonLibrary);
    await jsonResource.save();

    // The fragment uses the XMI syntax of the target document.
    const rawJson = JSON.parse(new TextDecoder().decode(await converter.readBinary(jsonUri)));
    expect(rawJson.$roots[0].featuredBook.$ref).toBe('mem:library.xmi#//@books.0');

    // Resolve it back, from a fresh ResourceSet.
    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const loadedJson = await freshSet.getResource(jsonUri, true);
    const proxy = loadedJson!.getContents().get(0).eGet(featuredBookRef) as EObject;
    expect(proxy.eIsProxy()).toBe(true);

    const resolved = await freshSet.resolve(proxy);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eClass()).toBe(bookClass);
  });

  it('an XMI document references an object in a JSON document', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    // The Book lives in a JSON document.
    const jsonUri = URI.parse('mem:library.json');
    const jsonResource = rs.createResource(jsonUri);
    const jsonLibrary = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (jsonLibrary.eGet(booksRef) as { add(v: EObject): void }).add(book);
    jsonResource.getContents().add(jsonLibrary);
    await jsonResource.save();

    // An XMI document references it.
    const xmiUri = URI.parse('mem:refs.xmi');
    const xmiResource = rs.createResource(xmiUri);
    const xmiLibrary = createInstanceOf(libraryClass);
    xmiLibrary.eSet(featuredBookRef, book);
    xmiResource.getContents().add(xmiLibrary);
    await xmiResource.save();

    // The fragment uses the JSON syntax of the target document ("Book_Dune", not "Dune").
    const rawXmi = new TextDecoder().decode(await converter.readBinary(xmiUri));
    expect(rawXmi).toContain('<featuredBook href="mem:library.json#Book_Dune"/>');

    const freshSet = newResourceSet(converter);
    freshSet.getPackageRegistry().register(libraryPackage);
    const loadedXmi = await freshSet.getResource(xmiUri, true);
    const proxy = loadedXmi!.getContents().get(0).eGet(featuredBookRef) as EObject;
    expect(proxy.eIsProxy()).toBe(true);

    const resolved = await freshSet.resolve(proxy);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eGet(titleAttr)).toBe('Dune');
  });
});
