import { ResourceFactory } from './resource-factory.js';
import { URI } from './uri.js';

/**
 * "Which ResourceFactory handles this URI?" - a separate concept from
 * EPackageRegistry (registry/epackage-registry.ts), despite EMF using the
 * word "Registry" for both: this one is about file *formats*, not
 * metamodels. Maps to EMF's Resource.Factory.Registry.
 */
export interface ResourceFactoryRegistry {
  /** e.g. registerForExtension('json', myFactory) matches "model.json". */
  registerForExtension(extension: string, factory: ResourceFactory): void;

  /** e.g. registerForProtocol('mem', myFactory) matches "mem://...". */
  registerForProtocol(protocol: string, factory: ResourceFactory): void;

  /**
   * Extension match wins over protocol match when both are registered and
   * applicable - registering a factory by extension is normally the more
   * deliberate, format-specific choice; protocol registration exists
   * mainly for schemes with no meaningful file extension.
   */
  getFactory(uri: URI): ResourceFactory | undefined;
}
