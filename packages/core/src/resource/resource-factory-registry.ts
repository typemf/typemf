import { ResourceFactory } from './resource-factory.js';
import { URI } from './uri.js';

/** Chooses the {@link ResourceFactory} for a URI, as EMF's `Resource.Factory.Registry`. */
export interface ResourceFactoryRegistry {
  /** e.g. registerForExtension('json', myFactory) matches "model.json". */
  registerForExtension(extension: string, factory: ResourceFactory): void;

  /** e.g. registerForProtocol('mem', myFactory) matches "mem://...". */
  registerForProtocol(protocol: string, factory: ResourceFactory): void;

  /** The factory registered for `uri`'s file extension, else for its scheme, else `undefined`. */
  getFactory(uri: URI): ResourceFactory | undefined;
}
