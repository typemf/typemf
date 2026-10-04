import type { EPackageRegistry, ResourceFactoryRegistry, ResourceSet, UriConverterRegistry } from '@typemf/core';

/**
 * The API the `typemf.vscode-runtime` extension returns from `activate()`. The registries are
 * shared, live objects: every extension sees the same instances.
 */
export interface TypeMfRuntimeApi {
  readonly packageRegistry: EPackageRegistry;
  readonly resourceFactoryRegistry: ResourceFactoryRegistry;
  readonly uriConverterRegistry: UriConverterRegistry;

  /** A new ResourceSet wired with the shared registries. */
  createResourceSet(): ResourceSet;

  /**
   * The single shared instance of module `name`, if its version satisfies `range`. Called by
   * code that the `@typemf/vscode-runtime/esbuild` plugin generates; throws on a missing module or
   * a version mismatch.
   */
  requireModule(name: string, range: string): unknown;
}
