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
import type { TypeMfRuntimeApi } from './api.js';
import { ModuleHost } from './module-host.js';
import { registerDefaults } from './register-defaults.js';
import { registerEcoreMetamodel } from './register-ecore-metamodel.js';

export interface TypeMfRuntimeOptions {
  /**
   * Whether to register the json/xmi/ecore formats and Ecore's own metamodel. Defaults to true.
   */
  registerDefaults?: boolean;
}

export class TypeMfRuntime implements TypeMfRuntimeApi {
  readonly packageRegistry: EPackageRegistry = new EPackageRegistryImpl();
  readonly resourceFactoryRegistry: ResourceFactoryRegistry = new ResourceFactoryRegistryImpl();
  readonly uriConverterRegistry: UriConverterRegistry = new UriConverterRegistryImpl();
  readonly modules = new ModuleHost();

  constructor(options: TypeMfRuntimeOptions = {}) {
    if (options.registerDefaults ?? true) {
      registerDefaults(this.resourceFactoryRegistry);
      registerEcoreMetamodel(this.packageRegistry);
    }
  }

  createResourceSet(): ResourceSet {
    return new ResourceSetImpl(this.packageRegistry, this.resourceFactoryRegistry, this.uriConverterRegistry);
  }

  requireModule(name: string, range: string): unknown {
    return this.modules.require(name, range);
  }
}
