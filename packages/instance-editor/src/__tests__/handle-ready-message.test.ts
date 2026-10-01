import { createInstanceOf, DynamicEFactoryImpl, EcorePackageImpl, EClassImpl, EPackageImpl, ResourceImpl, ResourceSetImpl, URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { handleReadyMessage } from '../handle-ready-message.js';
import { ObjectIdMap } from '../object-id-map.js';

void EcorePackageImpl.eINSTANCE;

describe('handleReadyMessage', () => {
  it('returns the real root object\'s own id', () => {
    const bookClass = new EClassImpl();
    bookClass.setName('Book');
    const pkg = new EPackageImpl();
    pkg.setName('library');
    pkg.setNsURI('https://example.com/library');
    pkg.getEClassifiers().add(bookClass);
    bookClass.setEPackage(pkg);
    pkg.setEFactoryInstance(new DynamicEFactoryImpl());
    const book = createInstanceOf(bookClass);

    const objectIds = new ObjectIdMap();
    const resourceSet = new ResourceSetImpl();
    const resource = new ResourceImpl(URI.parse('mem:x'), { serialize: async () => new Uint8Array(), deserialize: async () => [], peekReferencedNsURIs: async () => [] });
    resource.eSetResourceSet(resourceSet);
    resource.getContents().add(book);

    const init = handleReadyMessage({ objectIds, resource }, false);
    expect(init.rootId).toBe(objectIds.idFor(book));
  });

  it('returns undefined rootId for a genuinely empty document', () => {
    const objectIds = new ObjectIdMap();
    const resource = new ResourceImpl(URI.parse('mem:x'), { serialize: async () => new Uint8Array(), deserialize: async () => [], peekReferencedNsURIs: async () => [] });
    const init = handleReadyMessage({ objectIds, resource }, false);
    expect(init.rootId).toBeUndefined();
  });

  it('carries the given showDerivedFeatures value through unchanged', () => {
    const objectIds = new ObjectIdMap();
    const resource = new ResourceImpl(URI.parse('mem:x'), { serialize: async () => new Uint8Array(), deserialize: async () => [], peekReferencedNsURIs: async () => [] });
    expect(handleReadyMessage({ objectIds, resource }, true).showDerivedFeatures).toBe(true);
    expect(handleReadyMessage({ objectIds, resource }, false).showDerivedFeatures).toBe(false);
  });
});
