import { EPackageImpl, EPackageRegistryImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { registerIfNew } from '../register-if-new.js';

function makePackage(name: string, nsURI: string | undefined): EPackageImpl {
  const pkg = new EPackageImpl();
  pkg.setName(name);
  if (nsURI) pkg.setNsURI(nsURI);
  return pkg;
}

describe('registerIfNew', () => {
  it('registers a package whose nsURI is not registered yet', () => {
    const registry = new EPackageRegistryImpl();
    const pkg = makePackage('library', 'https://example.com/library');

    registerIfNew(registry, pkg);

    expect(registry.getPackage('https://example.com/library')).toBe(pkg);
  });

  it('does not replace a package already registered under the same nsURI', () => {
    const registry = new EPackageRegistryImpl();
    const existing = makePackage('library', 'https://example.com/library');
    const reloaded = makePackage('library', 'https://example.com/library');
    registry.register(existing);

    registerIfNew(registry, reloaded);

    expect(registry.getPackage('https://example.com/library')).toBe(existing);
  });

  it('still surfaces register()’s own error for a package with no nsURI', () => {
    const registry = new EPackageRegistryImpl();
    expect(() => registerIfNew(registry, makePackage('anonymous', undefined))).toThrow(/no nsURI/);
  });
});
