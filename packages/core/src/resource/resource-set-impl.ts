import { EPackage } from '../metamodel/types/EPackage.js';
import { EObject } from '../metamodel/types/EObject.js';
import { EStructuralFeature } from '../metamodel/types/EStructuralFeature.js';
import { EObjectImpl } from '../metamodel/impl/EObjectImpl.js';
import { isEClass, isENamedElement } from '../metamodel/util/EcoreTypeGuards.js';
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

    // A registered package answers for its own nsURI instead of a document, as EMF's package
    // registry does; it is never loaded as a resource.
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
    // The fragment grammar of the target's format applies, whatever format refers to it.
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
 * The element of `pkg` that an EMF name path addresses: each segment names an element contained in
 * the previous one, as in `//Class`, `//Class/feature`, `//sub/Class` or `//Enum/LITERAL`. A
 * feature of a class can also be one it inherits.
 */
export function resolveAgainstPackage(pkg: EPackage, fragment: string): EObject | undefined {
  const segments = fragment
    .replace(/^\/+/, '')
    .split('/')
    .filter((s) => s.length > 0);
  if (segments.length === 0) return undefined;

  let current: EObject | undefined = pkg;
  for (const name of segments) {
    const container: EObject = current;
    current =
      container.eContents().find((child) => isENamedElement(child) && child.getName() === name) ??
      (isEClass(container) ? container.getEStructuralFeature(name) : undefined);
    if (!current) return undefined;
  }
  return current;
}
