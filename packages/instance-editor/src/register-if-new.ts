import { EPackage, EPackageRegistry } from '@typemf/core';

/**
 * Registers pkg into registry unless something is already registered under the same nsURI -
 * EPackageRegistry.register() has no "don't overwrite" option of its own, so calling it
 * unconditionally for a package that might not actually be new (ED-06) silently replaces whatever
 * another extension - or an earlier resolution of the exact same dynamic metamodel, re-loaded
 * fresh via loadLocalEcorePackage every time and so never the same EPackage object twice - had
 * already registered under that nsURI, breaking every other open document still holding a
 * reference into the package that gets replaced. A package with no nsURI at all still goes
 * through register() itself, unconditionally, so its own "every registrable EPackage needs a
 * nsURI" error still surfaces exactly as before.
 */
export function registerIfNew(registry: EPackageRegistry, pkg: EPackage): void {
  const nsURI = pkg.getNsURI();
  if (!nsURI || !registry.containsPackage(nsURI)) registry.register(pkg);
}
