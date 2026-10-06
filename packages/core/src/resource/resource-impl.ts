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
 * getContents() as a live, unique list that keeps resource-utils.ts's side-table in sync. EMF
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

  /**
   * Concurrency-protected: `loaded` only flips to true once deserialize() fully finishes, so
   * multiple concurrent load() calls for this exact resource - genuinely racing, none of them
   * blocking on any of the others' own completion - used to each independently see
   * `!resource.isLoaded()` and start their own, fully separate deserialize() call. Collapsed here
   * into one: a call made while another is already in flight awaits that same, single,
   * already-running promise instead. The real fix for a real, confirmed exponential-blowup hazard
   * found this way: a self-referential metamodel (e.g. a "Feature contains child Features" style
   * containment cycle - a normal, valid pattern, not a modeling error) can have many concurrent,
   * independent resolve() calls converge on the same not-yet-finished resource.
   *
   * What this does NOT, and cannot, fix on its own: a caller that *directly awaits* a nested
   * load() call on this exact resource, from within this resource's own still-running
   * deserialize() itself, still deadlocks - confirmed directly, not just reasoned about. The
   * shared, returned promise can only resolve once deserialize() returns, but deserialize() would
   * now be waiting on that very promise, a genuine circular wait no Resource-level guard can
   * break. A caller with that exact shape (e.g. SnapshotSerializer's own reconstruction of a
   * self-referential metamodel) has to avoid making the reentrant load() call at all instead -
   * see SnapshotSerializer's own registry.objectFor() short-circuit for how.
   */
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
