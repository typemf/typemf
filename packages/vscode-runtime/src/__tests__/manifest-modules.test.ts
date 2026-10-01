import { EcorePackageImpl, EPackageImpl } from '@typemf/core';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { registerManifestModules } from '../manifest-modules.js';
import { TypeMfRuntime } from '../typemf-runtime.js';

void EcorePackageImpl.eINSTANCE;

const NS_URI = 'https://acme.example/library';

function libraryPackage(): EPackageImpl {
  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI(NS_URI);
  return pkg;
}

function providerExtension(modules: unknown) {
  return { id: 'acme.library', extensionPath: '/ext/library', packageJSON: { typemf: { modules } } };
}

describe('registerManifestModules', () => {
  it('declares the module and registers a descriptor that loads it on first lookup', () => {
    const runtime = new TypeMfRuntime();
    const pkg = libraryPackage();
    const loaded: string[] = [];
    const extension = providerExtension({
      '@acme/library': { path: 'dist/library.cjs', version: '1.0.0', packages: { [NS_URI]: 'LibraryPackageImpl' } },
    });

    const problems = registerManifestModules(runtime, [extension], (path) => {
      loaded.push(path);
      return { LibraryPackageImpl: { eINSTANCE: pkg } };
    });

    expect(problems).toEqual([]);
    expect(runtime.packageRegistry.containsPackage(NS_URI)).toBe(true);
    expect(loaded).toEqual([]);
    expect(runtime.packageRegistry.getPackage(NS_URI)).toBe(pkg);
    expect(loaded).toEqual([join('/ext/library', 'dist/library.cjs')]);
    expect(runtime.requireModule('@acme/library', '^1.0.0')).toEqual({ LibraryPackageImpl: { eINSTANCE: pkg } });
  });

  it('reports invalid entries and nsURIs that are already registered', () => {
    const runtime = new TypeMfRuntime();
    runtime.packageRegistry.register(libraryPackage());
    const extension = providerExtension({
      '@acme/broken': { version: '1.0.0' },
      '@acme/library': { path: 'library.cjs', version: '1.0.0', packages: { [NS_URI]: 'LibraryPackageImpl' } },
    });

    const problems = registerManifestModules(runtime, [extension], () => ({}));

    expect(problems).toEqual([
      "acme.library: module '@acme/broken' needs a string 'path' and 'version'.",
      `acme.library: nsURI '${NS_URI}' of module '@acme/library' is already registered; keeping the existing registration.`,
    ]);
  });

  it('fails the lookup when the export is not an EPackage', () => {
    const runtime = new TypeMfRuntime();
    const extension = providerExtension({
      '@acme/library': { path: 'library.cjs', version: '1.0.0', packages: { [NS_URI]: 'Wrong' } },
    });
    registerManifestModules(runtime, [extension], () => ({ Wrong: {} }));

    expect(() => runtime.packageRegistry.getPackage(NS_URI)).toThrow(/Export 'Wrong' of module '@acme\/library'/);
  });
});
