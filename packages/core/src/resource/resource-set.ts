import { EObject } from '../metamodel/types/EObject.js';
import { EStructuralFeature } from '../metamodel/types/EStructuralFeature.js';
import { EPackageRegistry } from '../registry/epackage-registry.js';
import { Resource } from './resource.js';
import { ResourceFactoryRegistry } from './resource-factory-registry.js';
import { URI } from './uri.js';
import { UriConverterRegistry } from './uri-converter-registry.js';

/**
 * A group of resources that can reference each other, with the registries used to load them, as
 * EMF's `ResourceSet`. There is no global package registry; each set has its own.
 */
export interface ResourceSet {
  /** The packages used to interpret loaded documents. */
  getPackageRegistry(): EPackageRegistry;

  /** The factories that create a resource for a URI. */
  getResourceFactoryRegistry(): ResourceFactoryRegistry;

  /** The converters that read and write the bytes behind a URI. */
  getUriConverterRegistry(): UriConverterRegistry;

  /** A copy of the list of resources in this set. */
  getResources(): Resource[];

  /**
   * Creates an unloaded resource for `uri` with the matching factory and adds it to this set.
   *
   * @throws Error if no factory is registered for `uri`.
   */
  createResource(uri: URI): Resource;

  /**
   * The resource in this set whose URI equals `uri` without its fragment. With `loadOnDemand`,
   * a missing resource is created, and an unloaded one is loaded.
   *
   * @returns `undefined` if there is no such resource and `loadOnDemand` is false.
   */
  getResource(uri: URI, loadOnDemand: boolean): Promise<Resource | undefined>;

  /** Removes `resource` from this set; its contents are left as they are. */
  removeResource(resource: Resource): void;

  /**
   * The object a proxy stands for, loading its document if necessary. A proxy URI naming a
   * registered package resolves against that package without loading anything. Returns `proxy`
   * itself if it is not a proxy. Does not replace the proxy where it is referenced; see
   * {@link resolveFeature}.
   *
   * @throws Error if the document cannot be loaded or contains no object at the URI's fragment.
   */
  resolve(proxy: EObject): Promise<EObject>;

  /**
   * Resolves the proxy held by a single-valued `feature` of `container`, stores the result in
   * the feature and notifies `RESOLVE`. Returns the current value unchanged if it is not a proxy;
   * many-valued features are not handled.
   *
   * @throws Error as {@link resolve}.
   */
  resolveFeature(container: EObject, feature: EStructuralFeature): Promise<unknown>;
}
