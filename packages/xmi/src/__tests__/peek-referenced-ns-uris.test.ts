import { createInstanceOf, ResourceSetImpl, URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { registerXmiFormat } from '../xmi-resource-factory.js';
import { XmiSerializer } from '../xmi-serializer.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

const serializer = new XmiSerializer();

function encode(xml: string): Uint8Array {
  return new TextEncoder().encode(xml);
}

describe('XmiSerializer.peekReferencedNsURIs', () => {
  it('returns every xmlns:* of the root element without a registered package', async () => {
    const content = encode(
      `<?xml version="1.0"?><lib:Library xmlns:lib="https://typemf.dev/samples/library" xmlns:other="https://example.com/other"/>`
    );
    const result = await serializer.peekReferencedNsURIs(content);
    expect(result.sort()).toEqual(['https://example.com/other', 'https://typemf.dev/samples/library']);
  });

  it('excludes the xmi and xsi namespaces', async () => {
    const content = encode(
      `<?xml version="1.0"?><lib:Library xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:lib="https://typemf.dev/samples/library"/>`
    );
    expect(await serializer.peekReferencedNsURIs(content)).toEqual(['https://typemf.dev/samples/library']);
  });

  it('returns an empty list for a root element with no namespace declarations', async () => {
    const content = encode(`<?xml version="1.0"?><Library/>`);
    expect(await serializer.peekReferencedNsURIs(content)).toEqual([]);
  });

  it('returns the nsURI of a document written by the serializer', async () => {
    const { libraryPackage, libraryClass } = buildSampleMetamodel();
    const library = createInstanceOf(libraryClass);
    const rs = new ResourceSetImpl();
    rs.getPackageRegistry().register(libraryPackage);
    registerXmiFormat(rs.getResourceFactoryRegistry());
    const resource = rs.createResource(URI.parse('mem:lib.xmi'));
    resource.getContents().add(library);
    const bytes = await serializer.serialize([library], resource);

    expect(await serializer.peekReferencedNsURIs(bytes)).toEqual(['https://typemf.dev/samples/library']);
  });
});
