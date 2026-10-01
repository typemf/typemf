import { describe, expect, it } from 'vitest';
import { createInstanceOf } from '../../metamodel/impl/metamodel-helpers.js';
import { EObject } from '../../metamodel/types/EObject.js';
import { buildSampleMetamodel } from '../../metamodel/__tests__/sample-metamodel.js';
import { ResourceImpl } from '../resource-impl.js';
import { EObjectSerializer } from '../serializer.js';
import { URI } from '../uri.js';
import { UriConverter } from '../uri-converter.js';

describe('ResourceImpl.load() reentrancy', () => {
  // NOTE on what this guard does NOT fix, confirmed directly: a caller that *directly awaits* a
  // nested load() call on the same resource from within that resource's own still-running
  // deserialize() still deadlocks - the returned, shared in-flight promise can only resolve once
  // deserialize() itself returns, but deserialize() is now waiting on that very promise. This
  // guard's real, confirmed value is what the two tests below show: collapsing genuinely
  // *concurrent* (not mutually-blocking) redundant loads into one deserialize() call, matching
  // exactly what getResource()'s own cross-Resource, cache-by-URI logic already does for
  // *separate* Resource objects racing for the same URI - extended here to a single Resource's
  // own concurrent calls to itself. A caller with a genuine, direct self-reference need (e.g.
  // SnapshotSerializer's own reconstruction of a self-referential metamodel, "Feature contains
  // child Features") must avoid the reentrant load() call entirely instead, which is exactly what
  // SnapshotSerializer's own registry.objectFor() short-circuit does (see its own reasoning) -
  // this guard alone was never sufficient for that case by itself, and isn't meant to be.

  it('two genuinely separate, sequential load() calls (not reentrant, not concurrent) each still work normally', async () => {
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

    // A later, genuinely separate call (e.g. an explicit reload) is unaffected by the reentrancy
    // guard - that only applies while a load is actually still in flight.
    await resource.load();
    expect(deserializeCallCount).toBe(2);
  });

  it('two concurrent (not reentrant, just both started before either finishes) load() calls also only deserialize once', async () => {
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
