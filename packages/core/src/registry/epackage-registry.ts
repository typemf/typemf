import { EPackage } from '../metamodel/types/EPackage.js';

/**
 * Supplies an EPackage on first use. Registered via `registerDescriptor()` so a package is only
 * loaded when it is first looked up. Maps to EMF's EPackage.Descriptor.
 */
export type EPackageDescriptor = () => EPackage;

/**
 * A lookup from namespace URI to EPackage - "which metamodel does this
 * nsURI mean?" Deliberately does not expose a global/ambient instance from
 * this module (see NOTES.md): a consuming app creates one explicitly near
 * its entry point, and @typemf/vscode-runtime's TypeMfRuntime is the one
 * legitimate *shared* instance for the multi-extension case, handed out via
 * activate() rather than reached for implicitly.
 *
 * Maps to EMF's org.eclipse.emf.ecore.EPackage.Registry.
 */
export interface EPackageRegistry {
  /** Registers `pkg` under its own `getNsURI()`. Throws if nsURI is unset. */
  register(pkg: EPackage): void;

  /** Registers `descriptor` under `nsURI`; it is called once, on the first lookup of `nsURI`. */
  registerDescriptor(nsURI: string, descriptor: EPackageDescriptor): void;

  /** Removes whatever package or descriptor is currently registered under `nsURI`, if any. */
  unregister(nsURI: string): void;

  /** The package registered under `nsURI`, resolving a descriptor if necessary. */
  getPackage(nsURI: string): EPackage | undefined;

  /** Whether some package or descriptor is currently registered under `nsURI`. */
  containsPackage(nsURI: string): boolean;

  /** Every registered package, in registration order. Resolves all descriptors. */
  getAllPackages(): EPackage[];
}
