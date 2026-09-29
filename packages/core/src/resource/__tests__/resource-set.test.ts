import { describe, expect, it } from 'vitest';
import { EClass } from '../../metamodel/types/EClass.js';
import { createInstanceOf } from '../../metamodel/impl/metamodel-helpers.js';
import { EObject } from '../../metamodel/types/EObject.js';
import { EReference } from '../../metamodel/types/EReference.js';
import { buildSampleMetamodel } from '../../metamodel/__tests__/sample-metamodel.js';
import { computeFragment } from '../eobject-address.js';
import { ProxyEObjectImpl } from '../proxy-eobject-impl.js';
import { Resource } from '../resource.js';
import { ResourceFactory } from '../resource-factory.js';
import { ResourceImpl } from '../resource-impl.js';
import { ResourceSetImpl } from '../resource-set-impl.js';
import { getResourceOf } from '../resource-utils.js';
import { EObjectSerializer } from '../serializer.js';
import { URI } from '../uri.js';
import { UriConverter } from '../uri-converter.js';

/**
 * A deliberately minimal fixture serializer/converter, built only to
 * exercise Resource/ResourceSet plumbing (load, save, cross-resource proxy
 * creation and resolution) - NOT a preview of @typemf/json's real design.
 * Classifier lookup is closed over test-local EClasses rather than going
 * through a package registry by nsURI, and only cross-resource
 * non-containment references are supported (the case this test actually
 * needs); a same-resource non-containment reference intentionally throws
 * rather than pretending to work, to avoid masking a real bug as a fixture
 * limitation.
 */
function buildFixtureIo(bookClass: EClass, libraryClass: EClass) {
  const eClassByName = new Map<string, EClass>([
    ['Book', bookClass],
    ['Library', libraryClass],
  ]);

  function serializeObject(obj: EObject, sourceResource: Resource): unknown {
    const json: Record<string, unknown> = { $eClass: obj.eClass().getName() };
    for (const feature of obj.eClass().getEAllStructuralFeatures()) {
      if (!obj.eIsSet(feature)) continue;
      const isReference = 'isContainment' in feature;
      if (!isReference) {
        json[feature.getName()!] = obj.eGet(feature);
        continue;
      }
      const refFeature = feature as EReference;
      if (feature.isMany()) {
        const children = (obj.eGet(feature) as Iterable<EObject>);
        json[feature.getName()!] = [...children].map((c) => serializeObject(c, sourceResource));
      } else if (refFeature.isContainment()) {
        json[feature.getName()!] = serializeObject(obj.eGet(feature) as EObject, sourceResource);
      } else {
        const target = obj.eGet(feature) as EObject;
        const targetResource = getResourceOf(target);
        if (!targetResource || targetResource === sourceResource) {
          throw new Error('Fixture serializer does not support same-resource non-containment references.');
        }
        json[feature.getName()!] = { $ref: target.fullId(), $refResource: targetResource.getURI().toString() };
      }
    }
    return json;
  }

  function deserializeObject(json: Record<string, unknown>, resource: Resource): EObject {
    const eClass = eClassByName.get(json.$eClass as string);
    if (!eClass) throw new Error(`Unknown $eClass '${json.$eClass as string}' in fixture data.`);
    const obj = createInstanceOf(eClass);
    for (const feature of eClass.getEAllStructuralFeatures()) {
      if (!(feature.getName()! in json)) continue;
      const raw = json[feature.getName()!];
      const isReference = 'isContainment' in feature;
      if (!isReference) {
        obj.eSet(feature, raw);
        continue;
      }
      const refFeature = feature as EReference;
      if (feature.isMany()) {
        const list = obj.eGet(feature) as { add(item: EObject): void };
        for (const childJson of raw as Record<string, unknown>[]) {
          list.add(deserializeObject(childJson, resource));
        }
      } else if (refFeature.isContainment()) {
        obj.eSet(feature, deserializeObject(raw as Record<string, unknown>, resource));
      } else {
        const { $ref, $refResource } = raw as { $ref: string; $refResource: string };
        const proxyEClass = refFeature.getEType() as EClass;
        obj.eSet(feature, new ProxyEObjectImpl(proxyEClass, URI.parse($refResource).withFragment($ref)));
      }
    }
    return obj;
  }

  const serializer: EObjectSerializer = {
    async serialize(roots: EObject[], resource: Resource): Promise<Uint8Array> {
      const json = roots.map((r) => serializeObject(r, resource));
      return new TextEncoder().encode(JSON.stringify(json));
    },
    async deserialize(content: Uint8Array, resource: Resource): Promise<EObject[]> {
      const json = JSON.parse(new TextDecoder().decode(content)) as Record<string, unknown>[];
      return json.map((r) => deserializeObject(r, resource));
    },
  };

  const factory: ResourceFactory = {
    createResource: (uri: URI) => new ResourceImpl(uri, serializer),
  };

  return { factory };
}

class InMemoryUriConverter implements UriConverter {
  private readonly store = new Map<string, Uint8Array>();

  constructor(private readonly scheme: string = 'mem') {}

  canHandle(uri: URI): boolean {
    return uri.getScheme() === this.scheme;
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

describe('ResourceSet + Resource (via an in-memory fixture format)', () => {
  it('saves and reloads a single resource with containment', async () => {
    const { bookClass, libraryClass, booksRef, titleAttr } = buildSampleMetamodel();
    const { factory } = buildFixtureIo(bookClass, libraryClass);
    const converter = new InMemoryUriConverter();

    const resourceSet = new ResourceSetImpl();
    resourceSet.getUriConverterRegistry().register(converter);
    resourceSet.getResourceFactoryRegistry().registerForProtocol('mem', factory);

    const uri = URI.parse('mem:library-a');
    const resource = resourceSet.createResource(uri);

    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (library.eGet(booksRef) as { add(item: EObject): void }).add(book);
    resource.getContents().add(library);

    await resource.save();

    const freshSet = new ResourceSetImpl();
    freshSet.getUriConverterRegistry().register(converter);
    freshSet.getResourceFactoryRegistry().registerForProtocol('mem', factory);
    const reloaded = await freshSet.getResource(uri, true);

    expect(reloaded).toBeDefined();
    expect(reloaded!.isLoaded()).toBe(true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedBooks = reloadedLibrary.eGet(booksRef) as Iterable<EObject>;
    expect([...reloadedBooks]).toHaveLength(1);
    expect([...reloadedBooks][0]!.eGet(titleAttr)).toBe('Dune');
  });

  it('creates a proxy for a cross-resource reference, and resolves it lazily via ResourceSet', async () => {
    const sample = buildSampleMetamodel();
    const { bookClass, libraryClass, booksRef, featuredBookRef, titleAttr } = sample;
    const { factory } = buildFixtureIo(bookClass, libraryClass);
    const converter = new InMemoryUriConverter();

    const resourceSet = new ResourceSetImpl();
    resourceSet.getUriConverterRegistry().register(converter);
    resourceSet.getResourceFactoryRegistry().registerForProtocol('mem', factory);

    // Resource A: a Library containing the actual Book.
    const uriA = URI.parse('mem:library-a');
    const resourceA = resourceSet.createResource(uriA);
    const libraryA = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (libraryA.eGet(booksRef) as { add(item: EObject): void }).add(book);
    resourceA.getContents().add(libraryA);
    await resourceA.save();

    // Resource B: a different Library whose featuredBook points at the Book in A.
    const uriB = URI.parse('mem:library-b');
    const resourceB = resourceSet.createResource(uriB);
    const libraryB = createInstanceOf(libraryClass);
    libraryB.eSet(featuredBookRef, book);
    resourceB.getContents().add(libraryB);
    await resourceB.save();

    // Fresh ResourceSet, loading ONLY resource B.
    const freshSet = new ResourceSetImpl();
    freshSet.getUriConverterRegistry().register(converter);
    freshSet.getResourceFactoryRegistry().registerForProtocol('mem', factory);
    const loadedB = await freshSet.getResource(uriB, true);
    const loadedLibraryB = loadedB!.getContents().get(0);

    const featuredBook = loadedLibraryB.eGet(featuredBookRef) as EObject;
    expect(featuredBook.eIsProxy()).toBe(true);
    expect(freshSet.getResources()).toHaveLength(1); // A not loaded yet

    const resolved = await freshSet.resolve(featuredBook);

    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eGet(titleAttr)).toBe('Dune');
    expect(freshSet.getResources()).toHaveLength(2); // A got loaded on demand
  });

  it('resolve() is a no-op for a non-proxy object', async () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');

    const resourceSet = new ResourceSetImpl();
    const result = await resourceSet.resolve(book);
    expect(result).toBe(book);
  });

  it('createResource throws a clear error when no factory is registered', () => {
    const resourceSet = new ResourceSetImpl();
    expect(() => resourceSet.createResource(URI.parse('mem:whatever'))).toThrow(/No ResourceFactory registered/);
  });

  it("load() throws a clear error when the resource has no UriConverter available", async () => {
    const { bookClass, libraryClass } = buildSampleMetamodel();
    const { factory } = buildFixtureIo(bookClass, libraryClass);
    const resourceSet = new ResourceSetImpl();
    resourceSet.getResourceFactoryRegistry().registerForProtocol('mem', factory);
    // Deliberately no converter registered.
    const resource = resourceSet.createResource(URI.parse('mem:no-converter'));
    await expect(resource.load()).rejects.toThrow(/no UriConverter available/);
  });

  it('resolves a cross-resource proxy addressed by a positional path, not just by ID', async () => {
    // Regression test: computeFragment()/resolveFragment() must be used
    // consistently for cross-resource addressing too, not just same-
    // resource. A target with no ID attribute set produces a positional
    // fragment ("/0/books/0"), and ResourceSet.resolve() must be able to
    // walk that against the *target* resource's own roots - this is
    // exactly the gap that existed before eobject-address.ts unified
    // same-resource and cross-resource fragment handling into one place.
    const { bookClass, libraryClass, booksRef, featuredBookRef } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter();

    const serializer: EObjectSerializer = {
      async serialize(roots: EObject[], resource: Resource): Promise<Uint8Array> {
        const json = roots.map((r) => serializeWithPositionalRefs(r, roots, resource));
        return new TextEncoder().encode(JSON.stringify(json));
      },
      async deserialize(content: Uint8Array, resource: Resource): Promise<EObject[]> {
        const json = JSON.parse(new TextDecoder().decode(content)) as Record<string, unknown>[];
        return json.map((r) => deserializeWithPositionalRefs(r, resource));
      },
    };

    function serializeWithPositionalRefs(obj: EObject, roots: EObject[], sourceResource: Resource): unknown {
      const json: Record<string, unknown> = { $eClass: obj.eClass().getName() };
      for (const feature of obj.eClass().getEAllStructuralFeatures()) {
        if (!obj.eIsSet(feature)) continue;
        const isReference = 'isContainment' in feature;
        if (!isReference) {
          json[feature.getName()!] = obj.eGet(feature);
          continue;
        }
        const refFeature = feature as EReference;
        if (feature.isMany()) {
          const children = [...(obj.eGet(feature) as Iterable<EObject>)];
          json[feature.getName()!] = children.map((c) => serializeWithPositionalRefs(c, roots, sourceResource));
        } else if (refFeature.isContainment()) {
          json[feature.getName()!] = serializeWithPositionalRefs(obj.eGet(feature) as EObject, roots, sourceResource);
        } else {
          const target = obj.eGet(feature) as EObject;
          const targetResource = getResourceOf(target)!;
          const targetRoots = targetResource.getContents().toArray();
          json[feature.getName()!] = {
            $ref: `${targetResource.getURI().toString()}#${computeFragment(target, targetRoots)}`,
          };
        }
      }
      return json;
    }

    function deserializeWithPositionalRefs(json: Record<string, unknown>, resource: Resource): EObject {
      const eClass = json.$eClass === 'Book' ? bookClass : libraryClass;
      const obj = createInstanceOf(eClass);
      for (const feature of eClass.getEAllStructuralFeatures()) {
        if (!(feature.getName()! in json)) continue;
        const raw = json[feature.getName()!];
        const isReference = 'isContainment' in feature;
        if (!isReference) {
          obj.eSet(feature, raw);
          continue;
        }
        const refFeature = feature as EReference;
        if (feature.isMany()) {
          const list = obj.eGet(feature) as { add(item: EObject): void };
          for (const childJson of raw as Record<string, unknown>[]) {
            list.add(deserializeWithPositionalRefs(childJson, resource));
          }
        } else if (refFeature.isContainment()) {
          obj.eSet(feature, deserializeWithPositionalRefs(raw as Record<string, unknown>, resource));
        } else {
          const { $ref } = raw as { $ref: string };
          obj.eSet(feature, new ProxyEObjectImpl(bookClass, URI.parse($ref)));
        }
      }
      return obj;
    }

    const factory: ResourceFactory = { createResource: (uri) => new ResourceImpl(uri, serializer) };
    const resourceSet = new ResourceSetImpl();
    resourceSet.getUriConverterRegistry().register(converter);
    resourceSet.getResourceFactoryRegistry().registerForProtocol('mem', factory);

    const uriA = URI.parse('mem:library-a');
    const resourceA = resourceSet.createResource(uriA);
    const libraryA = createInstanceOf(libraryClass);
    const untitledBook = createInstanceOf(bookClass); // deliberately no title -> no ID
    (libraryA.eGet(booksRef) as { add(item: EObject): void }).add(untitledBook);
    resourceA.getContents().add(libraryA);
    await resourceA.save();

    const uriB = URI.parse('mem:library-b');
    const resourceB = resourceSet.createResource(uriB);
    const libraryB = createInstanceOf(libraryClass);
    libraryB.eSet(featuredBookRef, untitledBook);
    resourceB.getContents().add(libraryB);
    await resourceB.save();

    const freshSet = new ResourceSetImpl();
    freshSet.getUriConverterRegistry().register(converter);
    freshSet.getResourceFactoryRegistry().registerForProtocol('mem', factory);
    const loadedB = await freshSet.getResource(uriB, true);
    const proxy = loadedB!.getContents().get(0).eGet(featuredBookRef) as EObject;
    expect(proxy.eIsProxy()).toBe(true);
    expect((proxy as ProxyEObjectImpl).getProxyURI().toString()).toBe('mem:library-a#/0/books/0');

    const resolved = await freshSet.resolve(proxy);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eClass()).toBe(bookClass);
  });

  it('supports two different transports registered in the same ResourceSet at once', async () => {
    // The scenario from the design discussion: a resource one "transport"
    // handles (e.g. a local-file-shaped scheme) cross-referencing an
    // object that lives behind a *different* scheme (e.g. a network-shaped
    // one) - neither converter needs to know the other exists, and neither
    // needs to handle both schemes itself.
    const { bookClass, libraryClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();
    const { factory } = buildFixtureIo(bookClass, libraryClass);

    const localConverter = new InMemoryUriConverter('local');
    const networkConverter = new InMemoryUriConverter('net');

    const resourceSet = new ResourceSetImpl();
    resourceSet.getUriConverterRegistry().register(localConverter);
    resourceSet.getUriConverterRegistry().register(networkConverter);
    resourceSet.getResourceFactoryRegistry().registerForProtocol('local', factory);
    resourceSet.getResourceFactoryRegistry().registerForProtocol('net', factory);

    // The Book lives behind the "network" transport.
    const netUri = URI.parse('net:library-remote');
    const netResource = resourceSet.createResource(netUri);
    const remoteLibrary = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (remoteLibrary.eGet(booksRef) as { add(item: EObject): void }).add(book);
    netResource.getContents().add(remoteLibrary);
    await netResource.save();

    // The referencing Library lives behind the "local" transport.
    const localUri = URI.parse('local:library-here');
    const localResource = resourceSet.createResource(localUri);
    const localLibrary = createInstanceOf(libraryClass);
    localLibrary.eSet(featuredBookRef, book);
    localResource.getContents().add(localLibrary);
    await localResource.save();

    // A fresh set, still with both converters registered, loading only
    // the "local" document and resolving across to the "net" one.
    const freshSet = new ResourceSetImpl();
    freshSet.getUriConverterRegistry().register(localConverter);
    freshSet.getUriConverterRegistry().register(networkConverter);
    freshSet.getResourceFactoryRegistry().registerForProtocol('local', factory);
    freshSet.getResourceFactoryRegistry().registerForProtocol('net', factory);

    const loadedLocal = await freshSet.getResource(localUri, true);
    expect(freshSet.getResources()).toHaveLength(1); // net resource not loaded yet

    const featuredBook = loadedLocal!.getContents().get(0).eGet(featuredBookRef) as EObject;
    expect(featuredBook.eIsProxy()).toBe(true);

    const resolved = await freshSet.resolve(featuredBook);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eGet(titleAttr)).toBe('Dune');
    expect(freshSet.getResources()).toHaveLength(2); // net resource loaded on demand, via its own converter
  });

  it("resolve() defers to the target resource's own serializer.resolveFragment() when it provides one", async () => {
    // Proves the mechanism @typemf/xmi relies on for cross-format
    // compatibility, without depending on @typemf/xmi from core: a
    // serializer using a deliberately different, non-default fragment
    // grammar ("CUSTOM:<index>" instead of core's own) must still resolve
    // correctly through the generic ResourceSet.resolve(), because it
    // supplies its own resolveFragment() rather than relying on core's.
    const { bookClass, libraryClass, booksRef, titleAttr } = buildSampleMetamodel();
    const converter = new InMemoryUriConverter('custom');

    const customSerializer: EObjectSerializer = {
      async serialize(): Promise<Uint8Array> {
        return new TextEncoder().encode('marker'); // content is irrelevant to this test
      },
      async deserialize(): Promise<EObject[]> {
        // Deliberately reconstructs fresh, ignoring the input bytes - this
        // fixture only exists to prove resolveFragment() dispatch, not to
        // be a real round-tripping serializer (that's covered by
        // @typemf/json's and @typemf/xmi's own test suites).
        const library = createInstanceOf(libraryClass);
        const book = createInstanceOf(bookClass);
        book.eSet(titleAttr, 'Dune');
        (library.eGet(booksRef) as { add(v: EObject): void }).add(book);
        return [library];
      },
      resolveFragment(fragment: string, roots: EObject[]): EObject | undefined {
        if (!fragment.startsWith('CUSTOM:')) return undefined;
        const index = Number(fragment.slice('CUSTOM:'.length));
        return roots[0]?.eAllContents()[index];
      },
    };
    const factory: ResourceFactory = { createResource: (uri) => new ResourceImpl(uri, customSerializer) };

    const resourceSet = new ResourceSetImpl();
    resourceSet.getUriConverterRegistry().register(converter);
    resourceSet.getResourceFactoryRegistry().registerForProtocol('custom', factory);

    const targetResource = resourceSet.createResource(URI.parse('custom:target'));
    await targetResource.save(); // writes the marker bytes via the converter

    const proxy = new ProxyEObjectImpl(bookClass, URI.parse('custom:target#CUSTOM:0'));
    const resolved = await resourceSet.resolve(proxy);
    expect(resolved.eIsProxy()).toBe(false);
    expect(resolved.eGet(titleAttr)).toBe('Dune');
  });
});

describe('getResourceOf() - root-walking for nested, non-root objects', () => {
  it('finds the owning resource for a contained (non-root) object by walking up to its root', () => {
    const { libraryClass, bookClass, booksRef } = buildSampleMetamodel();
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    (library.eGet(booksRef) as { add(item: unknown): void }).add(book);

    const resource = new ResourceImpl(URI.parse('mem:lib.xmi'), {
      serialize: async () => new Uint8Array(),
      deserialize: async () => [],
    });
    // Only the root (library) is ever added to getContents() - book is
    // reachable only via containment, never added directly. This is
    // exactly the case getResourceOf()'s root-walk exists for: nothing
    // above this associates `book` with a resource directly.
    resource.getContents().add(library);

    expect(getResourceOf(library)).toBe(resource);
    expect(getResourceOf(book)).toBe(resource);
  });

  it('returns undefined for an object that was never added to any resource at all', () => {
    const { bookClass } = buildSampleMetamodel();
    const orphan = createInstanceOf(bookClass);
    expect(getResourceOf(orphan)).toBeUndefined();
  });
});
