import {
  EPackageRegistry,
  EPackageRegistryImpl,
  ResourceFactoryRegistry,
  ResourceFactoryRegistryImpl,
  ResourceSet,
  ResourceSetImpl,
  UriConverterRegistry,
  UriConverterRegistryImpl,
} from '@typemf/core';
import { registerDefaults } from './register-defaults.js';
import { registerEcoreMetamodel } from './register-ecore-metamodel.js';

export interface TypeMfRuntimeOptions {
  /**
   * Whether the constructor calls registerDefaults() on its own resourceFactoryRegistry AND
   * registerEcoreMetamodel() on its own packageRegistry. Defaults to true - a caller who wants
   * genuinely clean registries (e.g. because they only care about a custom binary format and
   * don't want "xmi"/"ecore"/"json" claiming those extensions, or don't want Ecore's own
   * metamodel pre-registered either) opts out explicitly with `{ registerDefaults: false }`. One
   * flag for both, not two separate ones: a caller asking for a clean slate almost certainly wants
   * it fully clean, not partially so.
   */
  registerDefaults?: boolean;
}

/**
 * The public surface handed out to every dependent extension, via activate(). Deliberately an
 * interface, not the concrete TypeMfRuntime class itself: dependents type against this and can't
 * `instanceof` the real class, which leaves room to change TypeMfRuntime's own implementation
 * later without breaking the exported contract.
 *
 * This does NOT isolate dependent extensions from each other - the three registries below (and
 * any ResourceSet created from them) are the exact same live, mutable objects underneath, shared
 * across every extension that receives this same TypeMfRuntimeApi. One extension calling
 * `.packageRegistry.unregister(someOtherExtensionsNsUri)` still works. That isolation problem was
 * deliberately left unsolved for now (see the design discussion this package came out of) rather
 * than guessed at without a concrete second consumer to design the trust boundary against.
 */
export interface TypeMfRuntimeApi {
  readonly packageRegistry: EPackageRegistry;
  readonly resourceFactoryRegistry: ResourceFactoryRegistry;
  readonly uriConverterRegistry: UriConverterRegistry;

  /** A new ResourceSet wired with this runtime's three shared registries. */
  createResourceSet(): ResourceSet;
}

/**
 * The one legitimate shared-instance mechanism across every VS Code extension that depends on
 * this one: extensions bundling their own copy of @typemf/core each get their own separate module
 * instance (and therefore their own separate registries) even in the same extension host process,
 * so anything relying on shared identity - registry lookups, instanceof checks - silently breaks
 * across that boundary. A single TypeMfRuntime instance, exported via activate() and shared by
 * every extension declaring `extensionDependencies: ["typemf.vscode-runtime"]`, is what actually
 * guarantees one real, shared set of registries instead.
 *
 * uriConverterRegistry is created once here and reused by every ResourceSet this instance
 * produces (and so shared across every extension holding this same TypeMfRuntimeApi) - but
 * nothing is pre-registered into it. It starts genuinely empty; nothing resolves any URI through
 * it until some concrete, environment-specific UriConverter (Node's fs-backed one, or a future
 * browser fetch()-based one) is registered into it explicitly by whoever assembles the runtime
 * for that environment.
 */
export class TypeMfRuntime implements TypeMfRuntimeApi {
  readonly packageRegistry: EPackageRegistry = new EPackageRegistryImpl();
  readonly resourceFactoryRegistry: ResourceFactoryRegistry = new ResourceFactoryRegistryImpl();
  readonly uriConverterRegistry: UriConverterRegistry = new UriConverterRegistryImpl();

  constructor(options: TypeMfRuntimeOptions = {}) {
    if (options.registerDefaults ?? true) {
      registerDefaults(this.resourceFactoryRegistry);
      registerEcoreMetamodel(this.packageRegistry);
    }
  }

  createResourceSet(): ResourceSet {
    return new ResourceSetImpl(this.packageRegistry, this.resourceFactoryRegistry, this.uriConverterRegistry);
  }
}
