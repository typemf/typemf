import { describe, expect, it } from 'vitest';
import { createInstanceOf } from '../../metamodel/impl/metamodel-helpers.js';
import { EObject } from '../../metamodel/types/EObject.js';
import { buildSampleMetamodel } from '../../metamodel/__tests__/sample-metamodel.js';
import { ResourceImpl } from '../resource-impl.js';
import { EObjectSerializer } from '../serializer.js';
import { URI } from '../uri.js';
import { UriConverter } from '../uri-converter.js';

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
