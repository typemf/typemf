import { describe, expect, it } from 'vitest';
import { URI } from '../uri.js';
import { UriConverter } from '../uri-converter.js';
import { UriConverterRegistryImpl } from '../uri-converter-registry-impl.js';

function stubConverter(scheme: string): UriConverter {
  return {
    canHandle: (uri: URI) => uri.getScheme() === scheme,
    readBinary: async () => new Uint8Array(),
    writeBinary: async () => {},
    exists: async () => true,
  };
}

describe('UriConverterRegistryImpl', () => {
  it('dispatches to the converter whose canHandle() matches', () => {
    const registry = new UriConverterRegistryImpl();
    const fileConverter = stubConverter('file');
    const httpsConverter = stubConverter('https');
    registry.register(fileConverter);
    registry.register(httpsConverter);

    expect(registry.getConverter(URI.parse('file:///model.json'))).toBe(fileConverter);
    expect(registry.getConverter(URI.parse('https://typemf.dev/model.json'))).toBe(httpsConverter);
  });

  it('returns undefined when no registered converter handles the scheme', () => {
    const registry = new UriConverterRegistryImpl();
    registry.register(stubConverter('file'));
    expect(registry.getConverter(URI.parse('https://typemf.dev/model.json'))).toBeUndefined();
  });

  it('returns the first match when more than one converter could handle a URI', () => {
    const registry = new UriConverterRegistryImpl();
    const first = stubConverter('mem');
    const second = stubConverter('mem');
    registry.register(first);
    registry.register(second);
    expect(registry.getConverter(URI.parse('mem:whatever'))).toBe(first);
  });

  it('unregister removes a converter and is a no-op for one never registered', () => {
    const registry = new UriConverterRegistryImpl();
    const converter = stubConverter('file');
    registry.register(converter);
    registry.unregister(converter);
    expect(registry.getConverter(URI.parse('file:///model.json'))).toBeUndefined();
    expect(() => registry.unregister(converter)).not.toThrow();
  });

  it('getConverters reflects registration order', () => {
    const registry = new UriConverterRegistryImpl();
    const a = stubConverter('file');
    const b = stubConverter('https');
    registry.register(a);
    registry.register(b);
    expect(registry.getConverters()).toEqual([a, b]);
  });
});
