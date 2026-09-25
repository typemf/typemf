import { describe, expect, it } from 'vitest';
import { Resource } from '../resource.js';
import { ResourceFactory } from '../resource-factory.js';
import { ResourceFactoryRegistryImpl } from '../resource-factory-registry-impl.js';
import { URI } from '../uri.js';

function stubFactory(): ResourceFactory {
  return { createResource: (_uri: URI): Resource => ({}) as Resource };
}

describe('ResourceFactoryRegistryImpl', () => {
  it('resolves a factory registered by extension', () => {
    const registry = new ResourceFactoryRegistryImpl();
    const jsonFactory = stubFactory();
    registry.registerForExtension('json', jsonFactory);

    expect(registry.getFactory(URI.parse('file:///model.json'))).toBe(jsonFactory);
    expect(registry.getFactory(URI.parse('file:///model.xmi'))).toBeUndefined();
  });

  it('resolves a factory registered by protocol', () => {
    const registry = new ResourceFactoryRegistryImpl();
    const memFactory = stubFactory();
    registry.registerForProtocol('mem', memFactory);

    expect(registry.getFactory(URI.parse('mem:library-instance'))).toBe(memFactory);
  });

  it('prefers an extension match over a protocol match', () => {
    const registry = new ResourceFactoryRegistryImpl();
    const protocolFactory = stubFactory();
    const extensionFactory = stubFactory();
    registry.registerForProtocol('https', protocolFactory);
    registry.registerForExtension('json', extensionFactory);

    expect(registry.getFactory(URI.parse('https://typemf.dev/model.json'))).toBe(extensionFactory);
  });

  it('returns undefined when nothing matches', () => {
    const registry = new ResourceFactoryRegistryImpl();
    expect(registry.getFactory(URI.parse('file:///model.unknown'))).toBeUndefined();
  });
});
