import { Resource } from './resource.js';
import { URI } from './uri.js';

/**
 * Constructs an (unloaded) Resource for a given URI, wired with whichever
 * EObjectSerializer that factory speaks. Maps to EMF's
 * org.eclipse.emf.ecore.resource.Resource.Factory. @typemf/json's
 * JsonResourceFactory and @typemf/xmi's XmiResourceFactory are the two
 * built-in implementations; a third-party VSCode extension registering its
 * own format implements this same interface, no special-casing.
 */
export interface ResourceFactory {
  createResource(uri: URI): Resource;
}
