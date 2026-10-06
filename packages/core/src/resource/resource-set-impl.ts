import { EClassifier } from '../metamodel/types/EClassifier.js';
import { EObject } from '../metamodel/types/EObject.js';
import { EStructuralFeature } from '../metamodel/types/EStructuralFeature.js';
import { EObjectImpl } from '../metamodel/impl/EObjectImpl.js';
import { isEClass } from '../metamodel/util/EcoreTypeGuards.js';
import { EPackageRegistry } from '../registry/epackage-registry.js';
import { EPackageRegistryImpl } from '../registry/epackage-registry-impl.js';
import { resolveFragment } from './eobject-address.js';
import { getProxyURI } from './proxy.js';
import { Resource } from './resource.js';
import { ResourceFactoryRegistry } from './resource-factory-registry.js';
import { ResourceFactoryRegistryImpl } from './resource-factory-registry-impl.js';
import { ResourceSet } from './resource-set.js';
import { URI } from './uri.js';
import { UriConverterRegistry } from './uri-converter-registry.js';
import { UriConverterRegistryImpl } from './uri-converter-registry-impl.js';

export class ResourceSetImpl implements ResourceSet {
  private readonly resources: Resource[] = [];

  constructor(
    private readonly packageRegistry: EPackageRegistry = new EPackageRegistryImpl(),
    private readonly resourceFactoryRegistry: ResourceFactoryRegistry = new ResourceFactoryRegistryImpl(),
    private readonly uriConverterRegistry: UriConverterRegistry = new UriConverterRegistryImpl()
  ) {}

  getPackageRegistry(): EPackageRegistry {
    return this.packageRegistry;
  }

  getResourceFactoryRegistry(): ResourceFactoryRegistry {
    return this.resourceFactoryRegistry;
  }

  getUriConverterRegistry(): UriConverterRegistry {
    return this.uriConverterRegistry;
  }

  getResources(): Resource[] {
    return [...this.resources];
  }

  createResource(uri: URI): Resource {
    const factory = this.resourceFactoryRegistry.getFactory(uri);
    if (!factory) {
      throw new Error(
        `No ResourceFactory registered for '${uri.toString()}' (extension '${uri.getFileExtension() ?? '<none>'}', ` +
          `scheme '${uri.getScheme()}'). Register one via getResourceFactoryRegistry().registerForExtension(...) ` +
          'or .registerForProtocol(...) first.'
      );
    }
    const resource = factory.createResource(uri);
    resource.eSetResourceSet(this);
    this.resources.push(resource);
    return resource;
  }

  async getResource(uri: URI, loadOnDemand: boolean): Promise<Resource | undefined> {
    const trimmed = uri.trimFragment();
    let resource = this.resources.find((r) => r.getURI().trimFragment().equals(trimmed));

    if (!resource) {
      if (!loadOnDemand) return undefined;
      resource = this.createResource(trimmed);
    }

    if (!resource.isLoaded() && loadOnDemand) {
      await resource.load();
    }

    return resource;
  }

  removeResource(resource: Resource): void {
    const index = this.resources.indexOf(resource);
    if (index === -1) return;
    this.resources.splice(index, 1);
    resource.eSetResourceSet(undefined);
  }

  async resolve(proxy: EObject): Promise<EObject> {
    if (!proxy.eIsProxy()) return proxy;
    const proxyURI = getProxyURI(proxy);
    if (!proxyURI) {
      throw new Error(
        `eIsProxy() is true but no proxy URI is on record for this ${proxy.eClass().getName()} - it was not created via createProxy().`
      );
    }
    const proxyLabel = `${proxy.eClass().getName()} (${proxyURI.toString()})`;

    // A registered package's own nsURI as a "resource" to resolve into, exactly the way real
    // EMF's own EPackage.Registry doubles as a virtual resource for its own metamodel: a real,
    // confirmed gap found parsing an externally-authored file whose eType referenced Ecore's own
    // EString by its real, absolute nsURI (http://www.eclipse.org/emf/2002/Ecore#//EString) - the
    // mirror-image, read-side case of the write-side "treat an unattached, no-Resource object as
    // automatically local" bug fixed earlier in @typemf/xmi's own encodeReferenceValue, except
    // here the symptom is the opposite: trying to getResource()/createResource() a real URI that
    // was never meant to be loaded as a document at all, since a registered EPackage already *is*
    // the complete answer. Checked before the normal resource-loading path, not as a fallback
    // after it fails, since a registered package should never be re-fetched as if it were a
    // separate, unloaded document.
    const registeredPackage = this.packageRegistry.getPackage(proxyURI.trimFragment().toString());
    if (registeredPackage) {
      const fragment = proxyURI.getFragment();
      const resolved = fragment ? resolveAgainstPackage(registeredPackage, fragment) : undefined;
      if (!resolved) {
        throw new Error(
          `Could not resolve proxy '${proxyLabel}': fragment '${fragment ?? '<none>'}' did not match anything in ` +
            `the registered package '${registeredPackage.getNsURI() ?? '<no nsURI>'}'.`
        );
      }
      return resolved;
    }

    const targetResource = await this.getResource(proxyURI.trimFragment(), true);
    if (!targetResource) {
      throw new Error(`Could not resolve proxy '${proxyLabel}': its resource could not be loaded.`);
    }

    const fragment = proxyURI.getFragment();
    const roots = targetResource.getContents().toArray();
    const serializer = targetResource.getSerializer();
    // Defer to the target resource's OWN serializer's fragment grammar
    // when it provides one (e.g. @typemf/xmi's EMF grammar); fall back to
    // core's own default otherwise (e.g. for a plain @typemf/json target,
    // which never overrides this because its grammar already IS the
    // default). This is what makes cross-format references resolve
    // correctly - a json document's proxy into an xmi document, or vice
    // versa - since the target's format, not the referencing one, decides
    // how ITS fragments are read.
    const resolver = serializer.resolveFragment?.bind(serializer) ?? resolveFragment;
    const found = fragment ? resolver(fragment, roots) : undefined;
    if (!found) {
      throw new Error(
        `Could not resolve proxy '${proxyLabel}': fragment '${fragment ?? '<none>'}' did not match any ` +
          `object in '${targetResource.getURI().toString()}'.`
      );
    }
    return found;
  }

  async resolveFeature(container: EObject, feature: EStructuralFeature): Promise<unknown> {
    const current = container.eGet(feature);
    if (!isUnresolvedProxy(current)) return current;

    const resolved = await this.resolve(current);
    if (resolved !== current) {
      // eBasicSetValue/eNotify are EObjectImpl internals, not part of the public EObject
      // interface - every concrete EObject in this project extends EObjectImpl, same assumption
      // eDidAdd/eDidRemove already make (see EObjectImpl's own `instanceof EObjectImpl` checks).
      (container as EObjectImpl).eBasicSetValue(feature, resolved);
      (container as EObjectImpl).eNotify({
        eventType: 'RESOLVE',
        notifier: container,
        feature,
        oldValue: current,
        newValue: resolved,
        position: undefined,
        wasSet: true,
      });
    }
    return resolved;
  }
}

/** Only ever true for a single-valued reference's current value - a many-valued feature's own
 *  items are each resolved individually via plain resolve(), not through resolveFeature(). */
function isUnresolvedProxy(value: unknown): value is EObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as EObject).eIsProxy === 'function' &&
    (value as EObject).eIsProxy()
  );
}

/**
 * The real EMF-style name-based path within a registered package directly - "//Name" for a
 * top-level classifier, "//Name/Name2" for a feature or operation one level inside a class -
 * mirroring @typemf/xmi's own ecoreOwnFragmentPath (the write side of this same case), but here
 * general enough for any registered package's own nsURI, not just Ecore's own. A package has no
 * Resource, no containment tree, nothing eContainer()-walkable at all to defer to a serializer's
 * own fragment grammar for, so this is deliberately simple, name-segment resolution - exactly
 * what every real .ecore file's own attribute-form cross-references actually use.
 */
export function resolveAgainstPackage(
  pkg: { getEClassifier(name: string): EClassifier | undefined },
  fragment: string
): EObject | undefined {
  const segments = fragment
    .replace(/^\/+/, '')
    .split('/')
    .filter((s) => s.length > 0);
  if (segments.length === 0) return undefined;

  const classifier = pkg.getEClassifier(segments[0]!);
  if (segments.length === 1) return classifier;
  if (!classifier || !isEClass(classifier)) return undefined;

  return classifier.getEStructuralFeature(segments[1]!);
}
