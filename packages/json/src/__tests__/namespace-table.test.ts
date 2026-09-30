import { describe, expect, it } from 'vitest';
import { NamespaceTable } from '../namespace-table.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('NamespaceTable', () => {
  it('assigns a prefix from the package\'s own nsPrefix on first use', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const table = new NamespaceTable();
    expect(table.prefixFor(libraryPackage)).toBe('lib');
    expect(table.resolve('lib')).toBe('https://typemf.dev/samples/library');
  });

  it('returns the same prefix on repeated calls for the same package', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const table = new NamespaceTable();
    const first = table.prefixFor(libraryPackage);
    const second = table.prefixFor(libraryPackage);
    expect(first).toBe(second);
    expect(Object.keys(table.toJSON())).toHaveLength(1);
  });

  it('disambiguates a genuine collision between two different nsURIs wanting the same prefix', () => {
    const { libraryPackage: pkgA } = buildSampleMetamodel();
    const { libraryPackage: pkgB } = buildSampleMetamodel();
    pkgB.setNsURI('https://typemf.dev/samples/library-v2');
    // Same nsPrefix ("lib") on purpose, different nsURI - a real collision.

    const table = new NamespaceTable();
    const prefixA = table.prefixFor(pkgA);
    const prefixB = table.prefixFor(pkgB);

    expect(prefixA).toBe('lib');
    expect(prefixB).toBe('lib1');
    expect(table.resolve('lib1')).toBe('https://typemf.dev/samples/library-v2');
  });

  it('round-trips via the constructor + toJSON()', () => {
    const seed = { lib: 'https://typemf.dev/samples/library' };
    const table = new NamespaceTable(seed);
    expect(table.toJSON()).toEqual(seed);
    expect(table.resolve('lib')).toBe('https://typemf.dev/samples/library');
  });

  it('throws when a package has no nsURI set', () => {
    const { libraryPackage } = buildSampleMetamodel();
    libraryPackage.setNsURI('');
    const table = new NamespaceTable();
    expect(() => table.prefixFor(libraryPackage)).toThrow(/no nsURI set/);
  });
});
