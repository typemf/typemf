import { Resource } from './resource.js';
import { URI } from './uri.js';

/** Creates unloaded resources for one format, as EMF's `Resource.Factory`. */
export interface ResourceFactory {
  createResource(uri: URI): Resource;
}
