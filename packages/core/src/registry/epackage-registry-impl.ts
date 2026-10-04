import { EPackage } from '../metamodel/types/EPackage.js';
import { EPackageDescriptor, EPackageRegistry } from './epackage-registry.js';

export class EPackageRegistryImpl implements EPackageRegistry {
  private readonly entries = new Map<string, EPackage | EPackageDescriptor>();

  register(pkg: EPackage): void {
    const nsURI = pkg.getNsURI();
    if (!nsURI) {
      throw new Error(
        `Cannot register EPackage '${pkg.getName()}': it has no nsURI set. ` +
          'Every registrable EPackage needs a unique namespace URI - see setNsURI().'
      );
    }
    this.entries.set(nsURI, pkg);
  }

  registerDescriptor(nsURI: string, descriptor: EPackageDescriptor): void {
    this.entries.set(nsURI, descriptor);
  }

  unregister(nsURI: string): void {
    this.entries.delete(nsURI);
  }

  getPackage(nsURI: string): EPackage | undefined {
    const entry = this.entries.get(nsURI);
    if (typeof entry !== 'function') return entry;
    const pkg = entry();
    if (pkg.getNsURI() !== nsURI) {
      throw new Error(`The descriptor registered for '${nsURI}' returned a package with nsURI '${pkg.getNsURI()}'.`);
    }
    this.entries.set(nsURI, pkg);
    return pkg;
  }

  containsPackage(nsURI: string): boolean {
    return this.entries.has(nsURI);
  }

  getAllPackages(): EPackage[] {
    return [...this.entries.keys()].map((nsURI) => this.getPackage(nsURI)!);
  }
}
