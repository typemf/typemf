import { EList } from '../metamodel/types/EList.js';
import { EObject } from '../metamodel/types/EObject.js';
import { BasicEList } from '../metamodel/impl/BasicEList.js';
import { EObjectImpl } from '../metamodel/impl/EObjectImpl.js';
import { Diagnostic } from './diagnostic.js';
import { EObjectSerializer } from './serializer.js';
import { Resource } from './resource.js';
import { ResourceSet } from './resource-set.js';
import { associateRoot, dissociateRoot, getResourceOf } from './resource-utils.js';
import { URI } from './uri.js';
import { UriConverter } from './uri-converter.js';

/**
 * getContents() as a unique list that sets each root's resource (see EObject.eResource()). EMF
 * semantics: adding an object makes this resource its sole owner - if it was contained elsewhere,
 * it is detached from that container first; if it was itself a root of a different resource, it
 * is removed from that resource's own contents first. Adding an object already a root of *this*
 * resource is a no-op, so a root can never appear twice.
 */
class ResourceContentsList extends BasicEList<EObject> {
  constructor(private readonly owningResource: Resource) {
    super();
  }

  override add(item: EObject): void {
    if (this.contains(item)) return;
    this.detachFromCurrentOwner(item);
    super.add(item);
    associateRoot(item, this.owningResource);
  }

  override addAt(index: number, item: EObject): void {
    if (this.contains(item)) return;
    this.detachFromCurrentOwner(item);
    super.addAt(index, item);
    associateRoot(item, this.owningResource);
  }

  private detachFromCurrentOwner(item: EObject): void {
    const container = item.eContainer();
    if (container) {
      (item as EObjectImpl).eBasicDetachFromContainer();
      return;
    }
    const oldResource = getResourceOf(item);
    if (oldResource && oldResource !== this.owningResource) {
      oldResource.getContents().remove(item);
    }
  }

  override addAll(items: Iterable<EObject>): void {
    for (const item of items) this.add(item);
  }

  override remove(item: EObject): boolean {
    const removed = super.remove(item);
    if (removed) dissociateRoot(item);
    return removed;
  }

  override removeAt(index: number): EObject {
    const item = super.removeAt(index);
    dissociateRoot(item);
    return item;
  }

  override clear(): void {
    for (const item of this.toArray()) dissociateRoot(item);
    super.clear();
  }
}

export class ResourceImpl implements Resource {
  private readonly contents: ResourceContentsList = new ResourceContentsList(this);
  private loaded = false;
  private readonly errorList: Diagnostic[] = [];
  private readonly warningList: Diagnostic[] = [];
  private resourceSet: ResourceSet | undefined;
  private loadInProgress: Promise<void> | undefined;

  constructor(
    private uri: URI,
    private readonly serializer: EObjectSerializer,
    private readonly uriConverter?: UriConverter
  ) {}

  getURI(): URI {
    return this.uri;
  }

  setURI(uri: URI): void {
    this.uri = uri;
  }

  getContents(): EList<EObject> {
    return this.contents;
  }

  getResourceSet(): ResourceSet | undefined {
    return this.resourceSet;
  }

  getSerializer(): EObjectSerializer {
    return this.serializer;
  }

  eSetResourceSet(resourceSet: ResourceSet | undefined): void {
    this.resourceSet = resourceSet;
  }

  getErrors(): Diagnostic[] {
    return this.errorList;
  }

  getWarnings(): Diagnostic[] {
    return this.warningList;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  // A load already in progress is shared: a self-referential model can trigger many concurrent
  // resolve() calls into the same resource. A load() awaited from inside this resource's own
  // deserialize() would still deadlock.
  async load(): Promise<void> {
    if (this.loadInProgress) return this.loadInProgress;
    this.loadInProgress = this.doLoad();
    try {
      await this.loadInProgress;
    } finally {
      this.loadInProgress = undefined;
    }
  }

  private async doLoad(): Promise<void> {
    const converter = this.resolveUriConverter();
    const bytes = await converter.readBinary(this.uri);
    this.errorList.length = 0;
    this.warningList.length = 0;
    const roots = await this.serializer.deserialize(bytes, this);
    this.contents.clear();
    this.contents.addAll(roots);
    this.loaded = true;
  }

  async save(): Promise<void> {
    const converter = this.resolveUriConverter();
    const bytes = await this.serializer.serialize(this.contents.toArray(), this);
    await converter.writeBinary(this.uri, bytes);
  }

  unload(): void {
    this.contents.clear();
    this.loaded = false;
  }

  private resolveUriConverter(): UriConverter {
    const converter = this.uriConverter ?? this.resourceSet?.getUriConverterRegistry().getConverter(this.uri);
    if (!converter) {
      throw new Error(
        `Resource '${this.uri.toString()}' has no UriConverter available. Either construct it with one ` +
          "explicitly, or register one that handles this URI's scheme via the owning ResourceSet's " +
          "getUriConverterRegistry().register(...) (e.g. with @typemf/node's NodeFileUriConverter)."
      );
    }
    return converter;
  }
}
