import { describe, expect, it } from 'vitest';
import { EPackageRegistryImpl } from '../epackage-registry-impl.js';
import { buildSampleMetamodel } from '../../metamodel/__tests__/sample-metamodel.js';

describe('EPackageRegistryImpl', () => {
  it('registers a package under its own nsURI and looks it up again', () => {
    const registry = new EPackageRegistryImpl();
    const { libraryPackage } = buildSampleMetamodel();

    registry.register(libraryPackage);

    expect(registry.containsPackage('https://typemf.dev/samples/library')).toBe(true);
    expect(registry.getPackage('https://typemf.dev/samples/library')).toBe(libraryPackage);
    expect(registry.getPackage('https://nope.example')).toBeUndefined();
  });

  it('throws when registering a package with no nsURI set', () => {
    const registry = new EPackageRegistryImpl();
    const { libraryPackage } = buildSampleMetamodel();
    libraryPackage.setNsURI('');

    expect(() => registry.register(libraryPackage)).toThrow(/no nsURI set/);
  });

  it('overwrites whatever was previously registered under the same nsURI', () => {
    const registry = new EPackageRegistryImpl();
    const { libraryPackage } = buildSampleMetamodel();
    const { libraryPackage: otherLibraryPackage } = buildSampleMetamodel();

    registry.register(libraryPackage);
    registry.register(otherLibraryPackage);

    expect(registry.getPackage('https://typemf.dev/samples/library')).toBe(otherLibraryPackage);
    expect(registry.getAllPackages()).toHaveLength(1);
  });

  it('unregister removes a package and is a no-op for an unknown nsURI', () => {
    const registry = new EPackageRegistryImpl();
    const { libraryPackage } = buildSampleMetamodel();
    registry.register(libraryPackage);

    registry.unregister('https://typemf.dev/samples/library');
    expect(registry.containsPackage('https://typemf.dev/samples/library')).toBe(false);

    expect(() => registry.unregister('https://never-registered.example')).not.toThrow();
  });

  it('two independent registries do not see each other\'s registrations', () => {
    const registryA = new EPackageRegistryImpl();
    const registryB = new EPackageRegistryImpl();
    const { libraryPackage } = buildSampleMetamodel();

    registryA.register(libraryPackage);

    expect(registryA.containsPackage('https://typemf.dev/samples/library')).toBe(true);
    expect(registryB.containsPackage('https://typemf.dev/samples/library')).toBe(false);
  });

  it('getAllPackages reflects registration order', () => {
    const registry = new EPackageRegistryImpl();
    const first = buildSampleMetamodel().libraryPackage;
    first.setNsURI('https://typemf.dev/samples/first');
    const second = buildSampleMetamodel().libraryPackage;
    second.setNsURI('https://typemf.dev/samples/second');

    registry.register(first);
    registry.register(second);

    expect(registry.getAllPackages()).toEqual([first, second]);
  });
});
