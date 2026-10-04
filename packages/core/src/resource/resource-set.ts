import { EObject } from '../metamodel/types/EObject.js';
import { EPackageRegistry } from '../registry/epackage-registry.js';
import { Resource } from './resource.js';
import { ResourceFactoryRegistry } from './resource-factory-registry.js';
import { URI } from './uri.js';
import { UriConverterRegistry } from './uri-converter-registry.js';

/**
 * Owns a group of Resources, resolves cross-resource proxies by URI, and
 * carries its own EPackageRegistry (falling back to nothing global - see
 * NOTES.md - rather than a core-level ambient singleton). Maps to EMF's
 * org.eclipse.emf.ecore.resource.ResourceSet.
 */
export interface ResourceSet {
  getPackageRegistry(): EPackageRegistry;

  getResourceFactoryRegistry(): ResourceFactoryRegistry;

  /**
   * Which transport(s) this set can read/write through. A registry, not a
   * single slot, deliberately: a ResourceSet routinely needs more than one
   * transport at once (e.g. a local file:// document that cross-references
   * an object served over https://) - see the UriConverterRegistry doc
   * comment for the fuller rationale.
   */
  getUriConverterRegistry(): UriConverterRegistry;

  getResources(): Resource[];

  /** Looks up a ResourceFactory by `uri` and constructs a Resource, unloaded. */
  createResource(uri: URI): Resource;

  /**
   * Finds an already-tracked Resource matching `uri` (ignoring its
   * fragment); if none exists and `loadOnDemand` is true, creates and loads
   * one via createResource()/load(). If a matching Resource exists but
   * isn't loaded yet and `loadOnDemand` is true, loads it first.
   */
  getResource(uri: URI, loadOnDemand: boolean): Promise<Resource | undefined>;

  removeResource(resource: Resource): void;

  /**
   * If `proxy` is not actually a proxy, returns it unchanged. Otherwise
   * loads (if necessary) the resource the proxy points at and looks up the
   * referenced object by its fullId() within that resource's contents.
   * The EMF-EcoreUtil.resolve() equivalent.
   */
  resolve(proxy: EObject): Promise<EObject>;
}
