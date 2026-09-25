import { EPackage } from "../metamodel/types/EPackage.js";

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

  /** Removes whatever package is currently registered under `nsURI`, if any. */
  unregister(nsURI: string): void;

  getPackage(nsURI: string): EPackage | undefined;

  /** Whether some package is currently registered under `nsURI`. */
  containsPackage(nsURI: string): boolean;

  /** Every registered package, in registration order. */
  getAllPackages(): EPackage[];
}
