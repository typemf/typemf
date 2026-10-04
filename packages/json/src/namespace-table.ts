import { EPackage } from '@typemf/core';

/**
 * A document-scoped prefix table, exactly like XML namespace prefixes: a
 * short name ("lib") stands in for a full nsURI everywhere in the document
 * instead of repeating it on every single object's $eClass.
 *
 * Assignment is deterministic given the same object graph: it prefers each
 * EPackage's own getNsPrefix() (falling back to its name), and only
 * appends a numeric suffix on an actual collision between two different
 * packages that both want the same short name.
 */
export class NamespaceTable {
  private readonly prefixToUri = new Map<string, string>();
  private readonly uriToPrefix = new Map<string, string>();

  constructor(existing?: Record<string, string>) {
    for (const [prefix, uri] of Object.entries(existing ?? {})) {
      this.prefixToUri.set(prefix, uri);
      this.uriToPrefix.set(uri, prefix);
    }
  }

  /** Returns the prefix for `pkg`'s nsURI, assigning one on first use. */
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

  /** The nsURI a given prefix stands for in this document, if declared. */
  resolve(prefix: string): string | undefined {
    return this.prefixToUri.get(prefix);
  }

  toJSON(): Record<string, string> {
    return Object.fromEntries(this.prefixToUri);
  }
}
