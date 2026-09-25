import { EPackage } from '@typemf/core';

/**
 * Collects the xmlns:prefix declarations a document needs while writing
 * it, mutated as writeObject() walks the graph. Deliberately not shared
 * with @typemf/json's NamespaceTable - a different package, a different
 * attribute convention (xmlns:X here vs. a $namespaces JSON object there),
 * and the two packages shouldn't depend on each other regardless.
 */
export class NamespaceCollector {
  private readonly prefixToUri = new Map<string, string>();
  private readonly uriToPrefix = new Map<string, string>();

  prefixFor(pkg: EPackage): string {
    const nsURI = pkg.getNsURI();
    if (!nsURI) {
      throw new Error(`EPackage '${pkg.getName()}' has no nsURI set - cannot serialize instances of it.`);
    }

    const existing = this.uriToPrefix.get(nsURI);
    if (existing) return existing;

    const base = pkg.getNsPrefix() || pkg.getName() || 'ns';
    let candidate = base;
    let suffix = 0;
    while (this.prefixToUri.has(candidate) && this.prefixToUri.get(candidate) !== nsURI) {
      suffix += 1;
      candidate = `${base}${suffix}`;
    }

    this.prefixToUri.set(candidate, nsURI);
    this.uriToPrefix.set(nsURI, candidate);
    return candidate;
  }

  entries(): Array<[string, string]> {
    return [...this.prefixToUri.entries()];
  }
}
