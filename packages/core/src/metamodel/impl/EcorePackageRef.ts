import type { EcorePackage } from '../EcorePackage.js';

/**
 * A late-bound reference to the EcorePackage singleton,
 * set once by EcorePackageImpl's own constructor after
 * it finishes constructing itself.
 *
 * Every generated class needs a reference to the package singleton (for
 * eClass(), for feature-ID lookups in field initializers/lazy getters,
 * etc.) - and EcorePackageImpl itself constructs
 * (nearly) every one of those classes to build the runtime metamodel. For
 * an ordinary generated package that mutual reference is harmless: the
 * package singleton already exists in full by the time anything else is
 * ever constructed. But self-hosting a metamodel that describes itself
 * (as with real Ecore.ecore) makes this a genuine, confirmed hazard: a
 * real class along the package's own superclass chain, or a class that is
 * ALSO the superclass of something the package constructs directly (the
 * "EFactory unification" / "EPackage unification" cases), can end up
 * needing this reference while EcorePackageImpl is
 * still in the middle of constructing itself - a genuine circular
 * dependency, not merely an ordering preference, confirmed directly
 * against a real failing bundle ("Class extends value undefined is not a
 * constructor or null") while building this generator, not assumed.
 *
 * This module has only a type-only import (erased at compile time, zero
 * runtime footprint) - so importing FROM this module can never itself
 * participate in a circular dependency, unlike importing
 * EcorePackageImpl (or anything re-exporting it)
 * directly.
 */
let ref: EcorePackage | undefined;

export function setEcorePackageRef(pkg: EcorePackage): void {
  ref = pkg;
}

export function getEcorePackageRef(): EcorePackage {
  if (!ref) {
    throw new Error('getEcorePackageRef() called before the EcorePackage singleton finished constructing itself.');
  }
  return ref;
}
