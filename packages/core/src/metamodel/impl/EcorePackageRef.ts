import type { EcorePackage } from '../EcorePackage.js';

/**
 * A reference to the EcorePackage singleton that every generated class of the package
 * reads instead of importing EcorePackageImpl, which would be a circular import: the
 * package constructs those classes while it constructs itself. This module only has a type
 * import, so it can be imported from anywhere.
 */
let ref: EcorePackage | undefined;

/** Constructs the package on first use; registered when EcorePackageImpl.ts is evaluated. */
let initializer: (() => void) | undefined;
let initializing = false;

export function setEcorePackageRef(pkg: EcorePackage): void {
  ref = pkg;
}

export function registerEcorePackageInitializer(init: () => void): void {
  initializer = init;
}

export function getEcorePackageRef(): EcorePackage {
  // `initializing` turns a reentrant call during construction into the error below.
  if (!ref && initializer && !initializing) {
    initializing = true;
    try {
      initializer();
    } finally {
      initializing = false;
    }
  }
  if (!ref) {
    throw new Error(
      'getEcorePackageRef() called before the EcorePackage singleton finished constructing itself, and no ' +
        "initializer was registered to construct it on demand - this means EcorePackageImpl.ts's own module " +
        'was never evaluated at all (an unusual bundler/tree-shaking setup). Call EcorePackageImpl.eINSTANCE ' +
        'or .init() yourself first, or check that this package is marked side-effectful.'
    );
  }
  return ref;
}
