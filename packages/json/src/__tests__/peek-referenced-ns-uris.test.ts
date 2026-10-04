import { describe, expect, it } from 'vitest';
import { JsonSerializer } from '../json-serializer.js';
import { buildSampleMetamodel } from './sample-metamodel.js';
import { createInstanceOf, ResourceImpl, ResourceSetImpl, URI } from '@typemf/core';

const serializer = new JsonSerializer();

function encode(doc: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(doc));
}

describe('JsonSerializer.peekReferencedNsURIs', () => {
  it('returns every nsURI in $namespaces without a registered package', async () => {
    const content = encode({
      $namespaces: { lib: 'https://typemf.dev/samples/library', other: 'https://example.com/other' },
      $roots: [],
    });
    const result = await serializer.peekReferencedNsURIs(content);
    expect(result.sort()).toEqual(['https://example.com/other', 'https://typemf.dev/samples/library']);
  });

  it('returns an empty list for a document with no namespaces declared', async () => {
    const content = encode({ $roots: [] });
    expect(await serializer.peekReferencedNsURIs(content)).toEqual([]);
  });

  it('returns the nsURI of a document written by the serializer', async () => {
    const { libraryPackage, libraryClass } = buildSampleMetamodel();
    const library = createInstanceOf(libraryClass);
    const rs = new ResourceSetImpl();
    rs.getPackageRegistry().register(libraryPackage);
    const resource = new ResourceImpl(URI.parse('mem:lib.json'), serializer);
    resource.eSetResourceSet(rs);
    resource.getContents().add(library);
    const bytes = await serializer.serialize([library], resource);

    expect(await serializer.peekReferencedNsURIs(bytes)).toEqual(['https://typemf.dev/samples/library']);
  });
});
