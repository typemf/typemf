import { describe, expect, it } from 'vitest';
import { buildSampleMetamodel } from '../../metamodel/__tests__/sample-metamodel.js';
import { ProxyEObjectImpl } from '../proxy-eobject-impl.js';
import { URI } from '../uri.js';

describe('ProxyEObjectImpl', () => {
  it('reports eIsProxy() true and exposes its EClass and proxy URI', () => {
    const { bookClass } = buildSampleMetamodel();
    const uri = URI.parse('mem:library-a#Book_Dune');
    const proxy = new ProxyEObjectImpl(bookClass, uri);

    expect(proxy.eIsProxy()).toBe(true);
    expect(proxy.eClass()).toBe(bookClass);
    expect(proxy.getProxyURI().equals(uri)).toBe(true);
  });

  it('throws a clear error on any attempt to read/write its features', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const proxy = new ProxyEObjectImpl(bookClass, URI.parse('mem:library-a#Book_Dune'));

    expect(() => proxy.eGet(titleAttr)).toThrow(/resolve it via ResourceSet\.resolve\(\)/);
    expect(() => proxy.eSet(titleAttr, 'x')).toThrow(/resolve it via ResourceSet\.resolve\(\)/);
    expect(() => proxy.eIsSet(titleAttr)).toThrow(/resolve it via ResourceSet\.resolve\(\)/);
    expect(() => proxy.eUnset(titleAttr)).toThrow(/resolve it via ResourceSet\.resolve\(\)/);
  });

  it('reports empty containment content rather than throwing', () => {
    const { bookClass } = buildSampleMetamodel();
    const proxy = new ProxyEObjectImpl(bookClass, URI.parse('mem:library-a#Book_Dune'));

    expect(proxy.eContents().size()).toBe(0);
    expect(proxy.eAllContents()).toEqual([]);
  });

  it('fullId() describes the proxy without needing to resolve it', () => {
    const { bookClass } = buildSampleMetamodel();
    const proxy = new ProxyEObjectImpl(bookClass, URI.parse('mem:library-a#Book_Dune'));
    expect(proxy.fullId()).toBe('Proxy(Book, mem:library-a#Book_Dune)');
  });
});
