import { EPackage } from "../metamodel/types/EPackage.js";
import { EPackageRegistry } from "./epackage-registry.js";

export class EPackageRegistryImpl implements EPackageRegistry {
  private readonly packagesByNsURI = new Map<string, EPackage>();

  register(pkg: EPackage): void {
    const nsURI = pkg.getNsURI();
    if (!nsURI) {
      throw new Error(
        `Cannot register EPackage '${pkg.getName()}': it has no nsURI set. ` +
          "Every registrable EPackage needs a unique namespace URI - see setNsURI().",
      );
    }
    this.packagesByNsURI.set(nsURI, pkg);
  }

  unregister(nsURI: string): void {
    this.packagesByNsURI.delete(nsURI);
  }

  getPackage(nsURI: string): EPackage | undefined {
    return this.packagesByNsURI.get(nsURI);
  }

  containsPackage(nsURI: string): boolean {
    return this.packagesByNsURI.has(nsURI);
  }

  getAllPackages(): EPackage[] {
    return [...this.packagesByNsURI.values()];
  }
}
