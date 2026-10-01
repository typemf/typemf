import { createInstanceOf, ResourceImpl, ResourceSetImpl, URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { XmiSerializer } from '../xmi-serializer.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

const serializer = new XmiSerializer();

function encode(xml: string): Uint8Array {
  return new TextEncoder().encode(xml);
}

describe('XmiSerializer.peekReferencedNsURIs', () => {
  it('returns every xmlns:* declared on the root element, without needing any package registered', async () => {
    const content = encode(
      `<?xml version="1.0"?><lib:Library xmlns:lib="https://typemf.dev/samples/library" xmlns:other="https://example.com/other"/>`
    );
    const result = await serializer.peekReferencedNsURIs(content);
    expect(result.sort()).toEqual(['https://example.com/other', 'https://typemf.dev/samples/library']);
  });

  it('excludes the structural xmi/xsi namespaces - those are never a real, user-registrable metamodel', async () => {
    const content = encode(
      `<?xml version="1.0"?><lib:Library xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:lib="https://typemf.dev/samples/library"/>`
    );
    expect(await serializer.peekReferencedNsURIs(content)).toEqual(['https://typemf.dev/samples/library']);
  });

  it('returns an empty list for a root element with no namespace declarations', async () => {
    const content = encode(`<?xml version="1.0"?><Library/>`);
    expect(await serializer.peekReferencedNsURIs(content)).toEqual([]);
  });

  it('real round-trip: a document actually written by this serializer peeks back its own real nsURI', async () => {
    const { libraryPackage, libraryClass } = buildSampleMetamodel();
    const library = createInstanceOf(libraryClass);
    const rs = new ResourceSetImpl();
    rs.getPackageRegistry().register(libraryPackage);
    const resource = new ResourceImpl(URI.parse('mem:lib.xmi'), serializer);
    resource.eSetResourceSet(rs);
    resource.getContents().add(library);
    const bytes = await serializer.serialize([library], resource);

    expect(await serializer.peekReferencedNsURIs(bytes)).toEqual(['https://typemf.dev/samples/library']);
  });
});
