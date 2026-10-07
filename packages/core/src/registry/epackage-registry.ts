import { EPackage } from '../metamodel/types/EPackage.js';

/**
 * Supplies an EPackage on first use. Registered via `registerDescriptor()` so a package is only
 * loaded when it is first looked up. Maps to EMF's EPackage.Descriptor.
 */
export type EPackageDescriptor = () => EPackage;

/**
 * Maps namespace URIs to packages, as EMF's `EPackage.Registry`. There is no global instance;
 * each `ResourceSet` has its own.
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
