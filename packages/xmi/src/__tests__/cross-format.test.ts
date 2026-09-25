import { EObject, ResourceSetImpl, URI, UriConverter } from '@typemf/core';
import { registerJsonFormat } from '@typemf/json';
import { describe, expect, it } from 'vitest';
import { registerXmiFormat } from '../xmi-resource-factory.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

/**
 * This is the actual payoff of the "option 2" design (Resource.getSerializer()
 * + EObjectSerializer.computeFragment/resolveFragment): a resource written by
 * one format can correctly cross-reference an object living in a resource
 * written by a DIFFERENT format. Each direction below writes a fragment using
 * the TARGET's own grammar (proven by inspecting the raw bytes, not just by
 * successful resolution - a bug here could easily "accidentally" resolve via
 * a linear id-match fallback while writing the wrong grammar), and resolves
 * it back correctly from a fresh ResourceSet with no shared in-memory state.
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
  it('a JSON document correctly references an object living in an XMI document', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    // The Book lives in an XMI document.
    const xmiUri = URI.parse('mem:library.xmi');
    const xmiResource = rs.createResource(xmiUri);
    const xmiLibrary = libraryClass.createInstance();
    const untitledBook = bookClass.createInstance(); // no ID -> exercises EMF's positional grammar specifically
    (xmiLibrary.eGet(booksRef) as { add(v: EObject): void }).add(untitledBook);
    xmiResource.getContents().add(xmiLibrary);
    await xmiResource.save();

    // A JSON document references it.
    const jsonUri = URI.parse('mem:refs.json');
    const jsonResource = rs.createResource(jsonUri);
    const jsonLibrary = libraryClass.createInstance();
    jsonLibrary.eSet(featuredBookRef, untitledBook);
    jsonResource.getContents().add(jsonLibrary);
    await jsonResource.save();

    // Inspect the raw JSON: the fragment must be EMF's grammar
    // ("//@books.0"), NOT @typemf/json's own default grammar, because the
    // TARGET (the xmi document) is what decides its own addressing.
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

  it('an XMI document correctly references an object living in a JSON document', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();
    const rs = newResourceSet(converter);
    rs.getPackageRegistry().register(libraryPackage);

    // The Book lives in a JSON document.
    const jsonUri = URI.parse('mem:library.json');
    const jsonResource = rs.createResource(jsonUri);
    const jsonLibrary = libraryClass.createInstance();
    const book = bookClass.createInstance();
    book.eSet(titleAttr, 'Dune');
    (jsonLibrary.eGet(booksRef) as { add(v: EObject): void }).add(book);
    jsonResource.getContents().add(jsonLibrary);
    await jsonResource.save();

    // An XMI document references it.
    const xmiUri = URI.parse('mem:refs.xmi');
    const xmiResource = rs.createResource(xmiUri);
    const xmiLibrary = libraryClass.createInstance();
    xmiLibrary.eSet(featuredBookRef, book);
    xmiResource.getContents().add(xmiLibrary);
    await xmiResource.save();

    // Inspect the raw XML: the fragment must be @typemf/json's default
    // grammar ("Book_Dune" via core's fullId()), NOT EMF's own bare-ID
    // grammar ("Dune"), because the TARGET (the json document) decides.
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
