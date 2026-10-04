import { describe, expect, it } from 'vitest';
import { URI } from '../uri.js';

describe('URI', () => {
  it('parses scheme, authority-bearing path, and fragment', () => {
    const uri = URI.parse('https://typemf.dev/samples/library.json#Book_Dune');
    expect(uri.getScheme()).toBe('https');
    expect(uri.getPath()).toBe('typemf.dev/samples/library.json');
    expect(uri.getFragment()).toBe('Book_Dune');
  });

  it('parses a scheme with no authority marker', () => {
    const uri = URI.parse('mem:library-instance');
    expect(uri.getScheme()).toBe('mem');
    expect(uri.getPath()).toBe('library-instance');
    expect(uri.getFragment()).toBeUndefined();
  });

  it('round-trips via toString()', () => {
    const original = 'https://typemf.dev/samples/library.json#Book_Dune';
    expect(URI.parse(original).toString()).toBe(original);
  });

  it('throws for a string with no scheme', () => {
    expect(() => URI.parse('not-a-uri')).toThrow(/Not a valid absolute URI/);
  });

  it('createFileURI wraps a path as a file: URI', () => {
    const uri = URI.createFileURI('/home/user/model.ecore');
    expect(uri.toString()).toBe('file:///home/user/model.ecore');
    expect(uri.getFileExtension()).toBe('ecore');
  });

  it('getFileExtension is undefined when there is no dot in the last segment', () => {
    expect(URI.parse('mem:library-instance').getFileExtension()).toBeUndefined();
  });

  it('withFragment/trimFragment produce new URIs without mutating the original', () => {
    const base = URI.parse('https://typemf.dev/samples/library.json');
    const withFragment = base.withFragment('Book_Dune');

    expect(base.getFragment()).toBeUndefined();
    expect(withFragment.getFragment()).toBe('Book_Dune');
    expect(withFragment.trimFragment().equals(base)).toBe(true);
  });

  it('equals compares by serialized form', () => {
    const a = URI.parse('https://typemf.dev/samples/library.json');
    const b = URI.parse('https://typemf.dev/samples/library.json');
    const c = URI.parse('https://typemf.dev/samples/other.json');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
