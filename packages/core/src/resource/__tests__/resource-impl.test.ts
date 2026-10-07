import { describe, expect, it } from 'vitest';
import { createInstanceOf } from '../../metamodel/impl/metamodel-helpers.js';
import { EObject } from '../../metamodel/types/EObject.js';
import { buildSampleMetamodel } from '../../metamodel/__tests__/sample-metamodel.js';
import { ResourceImpl } from '../resource-impl.js';
import { EObjectSerializer } from '../serializer.js';
import { URI } from '../uri.js';
import { UriConverter } from '../uri-converter.js';

function noopResourceDeps(): { converter: UriConverter; serializer: EObjectSerializer } {
  return {
    converter: {
      canHandle: () => true,
      readBinary: async () => new Uint8Array(),
      writeBinary: async () => {},
      exists: async () => true,
    },
    serializer: {
      async serialize(): Promise<Uint8Array> {
        return new Uint8Array();
      },
      async deserialize(): Promise<EObject[]> {
        return [];
      },
      async peekReferencedNsURIs(): Promise<string[]> {
        return [];
      },
    },
  };
}

describe('ResourceImpl.load()', () => {
  it('deserializes again on each sequential call', async () => {
    const { bookClass } = buildSampleMetamodel();
    const uri = URI.parse('mem:sequential.bin');
    let deserializeCallCount = 0;

    const converter: UriConverter = {
      canHandle: () => true,
      readBinary: async () => new Uint8Array(),
      writeBinary: async () => {},
      exists: async () => true,
    };
    const serializer: EObjectSerializer = {
      async serialize(): Promise<Uint8Array> {
        return new Uint8Array();
      },
      async deserialize(): Promise<EObject[]> {
        deserializeCallCount++;
        return [createInstanceOf(bookClass)];
      },
      async peekReferencedNsURIs(): Promise<string[]> {
        return [];
      },
    };

    const resource = new ResourceImpl(uri, serializer, converter);
    await resource.load();
    expect(deserializeCallCount).toBe(1);

    await resource.load();
    expect(deserializeCallCount).toBe(2);
  });

  it('deserializes once for concurrent calls', async () => {
    const { bookClass } = buildSampleMetamodel();
    const uri = URI.parse('mem:concurrent.bin');
    let deserializeCallCount = 0;
    let resolveReadBinary!: () => void;

    const converter: UriConverter = {
      canHandle: () => true,
      readBinary: () => new Promise<Uint8Array>((resolve) => (resolveReadBinary = () => resolve(new Uint8Array()))),
      writeBinary: async () => {},
      exists: async () => true,
    };
    const serializer: EObjectSerializer = {
      async serialize(): Promise<Uint8Array> {
        return new Uint8Array();
      },
      async deserialize(): Promise<EObject[]> {
        deserializeCallCount++;
        return [createInstanceOf(bookClass)];
      },
      async peekReferencedNsURIs(): Promise<string[]> {
        return [];
      },
    };

    const resource = new ResourceImpl(uri, serializer, converter);
    const first = resource.load();
    const second = resource.load();
    resolveReadBinary();
    await Promise.all([first, second]);

    expect(deserializeCallCount).toBe(1);
  });
});

describe('ResourceImpl.getContents() content ownership', () => {
  it('adding a root already owned by another resource removes it from that resource', () => {
    const { bookClass } = buildSampleMetamodel();
    const { converter, serializer } = noopResourceDeps();
    const resourceA = new ResourceImpl(URI.parse('mem:a.bin'), serializer, converter);
    const resourceB = new ResourceImpl(URI.parse('mem:b.bin'), serializer, converter);
    const book = createInstanceOf(bookClass);

    resourceA.getContents().add(book);
    expect(resourceA.getContents().toArray()).toEqual([book]);

    resourceB.getContents().add(book);
    expect(resourceA.getContents().toArray()).toEqual([]);
    expect(resourceB.getContents().toArray()).toEqual([book]);
  });

  it('adding a contained object as a root removes it from its container', () => {
    const { libraryClass, bookClass } = buildSampleMetamodel();
    const { converter, serializer } = noopResourceDeps();
    const resource = new ResourceImpl(URI.parse('mem:library.bin'), serializer, converter);
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    (library.eGet(libraryClass.getEStructuralFeature('books')!) as { add(item: EObject): void }).add(book);
    expect(book.eContainer()).toBe(library);

    resource.getContents().add(book);

    expect(book.eContainer()).toBeUndefined();
    const books = library.eGet(libraryClass.getEStructuralFeature('books')!) as { toArray(): EObject[] };
    expect(books.toArray()).toEqual([]);
    expect(resource.getContents().toArray()).toEqual([book]);
  });

  it('adding the same root twice does not duplicate it', () => {
    const { bookClass } = buildSampleMetamodel();
    const { converter, serializer } = noopResourceDeps();
    const resource = new ResourceImpl(URI.parse('mem:dup.bin'), serializer, converter);
    const book = createInstanceOf(bookClass);

    resource.getContents().add(book);
    resource.getContents().add(book);

    expect(resource.getContents().toArray()).toEqual([book]);
  });
});
