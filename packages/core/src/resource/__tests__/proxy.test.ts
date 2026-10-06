import { describe, expect, it } from 'vitest';
import { buildSampleMetamodel } from '../../metamodel/__tests__/sample-metamodel.js';
import { createProxy, getProxyURI } from '../proxy.js';
import { URI } from '../uri.js';

describe('createProxy', () => {
  it('reports eIsProxy() true and exposes its EClass and proxy URI', () => {
    const { bookClass } = buildSampleMetamodel();
    const uri = URI.parse('mem:library-a#Book_Dune');
    const proxy = createProxy(bookClass, uri);

    expect(proxy.eIsProxy()).toBe(true);
    expect(proxy.eClass()).toBe(bookClass);
    expect(getProxyURI(proxy)?.equals(uri)).toBe(true);
  });

  it("returns the class's own normal defaults on a feature read, rather than throwing", () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const proxy = createProxy(bookClass, URI.parse('mem:library-a#Book_Dune'));

    expect(() => proxy.eGet(titleAttr)).not.toThrow();
    expect(proxy.eIsSet(titleAttr)).toBe(false);
  });

  it('eSet works like on any ordinary, freshly-constructed instance', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    const proxy = createProxy(bookClass, URI.parse('mem:library-a#Book_Dune'));

    proxy.eSet(titleAttr, 'Dune');
    expect(proxy.eGet(titleAttr)).toBe('Dune');
  });

  it('reports empty containment content, like any other just-constructed instance', () => {
    const { bookClass } = buildSampleMetamodel();
    const proxy = createProxy(bookClass, URI.parse('mem:library-a#Book_Dune'));

    expect(proxy.eContents().size()).toBe(0);
    expect(proxy.eAllContents()).toEqual([]);
  });

  it('getProxyURI() is undefined for an ordinary, non-proxy object', () => {
    const { bookClass } = buildSampleMetamodel();
    const book = createProxy(bookClass, URI.parse('mem:library-a#Book_Dune'));
    expect(getProxyURI(book)).toBeDefined();

    const other = bookClass.getEPackage()!.getEFactoryInstance()!.create(bookClass);
    expect(getProxyURI(other)).toBeUndefined();
    expect(other.eIsProxy()).toBe(false);
  });
});
