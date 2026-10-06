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

  it('a string with no scheme is a relative reference, not an error', () => {
    const uri = URI.parse('not-a-uri');
    expect(uri.isRelative()).toBe(true);
    expect(uri.getScheme()).toBeUndefined();
    expect(uri.getPath()).toBe('not-a-uri');
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

  describe('resolve', () => {
    it('resolves a same-directory relative reference against a base file', () => {
      const base = URI.createFileURI('/workspaces/project/city.xmi');
      const resolved = URI.parse('campus.xmi#//@books.0').resolve(base);
      expect(resolved.toString()).toBe('file:///workspaces/project/campus.xmi#//@books.0');
    });

    it('resolves ".." and "." segments', () => {
      const base = URI.createFileURI('/workspaces/project/sub/city.xmi');
      expect(URI.parse('../campus.xmi').resolve(base).toString()).toBe('file:///workspaces/project/campus.xmi');
      expect(URI.parse('./campus.xmi').resolve(base).toString()).toBe('file:///workspaces/project/sub/campus.xmi');
    });

    it('leaves an already-absolute URI unchanged', () => {
      const base = URI.createFileURI('/workspaces/project/city.xmi');
      const absolute = URI.parse('https://example.org/other.xmi#frag');
      expect(absolute.resolve(base).equals(absolute)).toBe(true);
    });

    it('is the exact inverse of deresolve', () => {
      const base = URI.createFileURI('/workspaces/project/city.xmi');
      const target = URI.createFileURI('/workspaces/other/campus.xmi').withFragment('frag');
      expect(target.deresolve(base).resolve(base).equals(target)).toBe(true);
    });
  });

  describe('deresolve', () => {
    it('produces a bare filename for a sibling in the same directory', () => {
      const base = URI.createFileURI('/workspaces/project/city.xmi');
      const target = URI.createFileURI('/workspaces/project/campus.xmi').withFragment('//@books.0');
      expect(target.deresolve(base).toString()).toBe('campus.xmi#//@books.0');
    });

    it('walks up with ".." for a target outside the base directory', () => {
      const base = URI.createFileURI('/workspaces/project/sub/city.xmi');
      const target = URI.createFileURI('/workspaces/other/campus.xmi');
      expect(target.deresolve(base).toString()).toBe('../../other/campus.xmi');
    });

    it('leaves the URI unchanged when the schemes differ', () => {
      const base = URI.createFileURI('/workspaces/project/city.xmi');
      const target = URI.parse('https://example.org/campus.xmi');
      expect(target.deresolve(base).equals(target)).toBe(true);
    });

    it('leaves an already-relative URI unchanged', () => {
      const base = URI.createFileURI('/workspaces/project/city.xmi');
      const relative = URI.parse('campus.xmi');
      expect(relative.deresolve(base).equals(relative)).toBe(true);
    });
  });
});
