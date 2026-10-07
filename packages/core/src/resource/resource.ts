import { EList } from '../metamodel/types/EList.js';
import { EObject } from '../metamodel/types/EObject.js';
import { Diagnostic } from './diagnostic.js';
import { EObjectSerializer } from './serializer.js';
import { ResourceSet } from './resource-set.js';
import { URI } from './uri.js';

/** A document: a URI and the root objects stored there, as EMF's `Resource`. */
export interface Resource {
  /** The location the resource is loaded from and saved to. */
  getURI(): URI;

  /** Changes the location used by later loads and saves; nothing is moved or written. */
  setURI(uri: URI): void;

  /**
   * The root objects. Adding an object makes this resource its only owner: it is removed from
   * its container or from another resource's contents first. An object is never added twice.
   */
  getContents(): EList<EObject>;

  /** The resource set this resource was created by, if any. */
  getResourceSet(): ResourceSet | undefined;

  /** Problems recorded by the last load that make the content incomplete. */
  getErrors(): Diagnostic[];

  /** Problems recorded by the last load that the content survived. */
  getWarnings(): Diagnostic[];

  /** Whether a load has completed since creation or the last {@link unload}. */
  isLoaded(): boolean;

  /** The format the resource is read and written in. */
  getSerializer(): EObjectSerializer;

  /**
   * Reads the document and replaces the contents with what was read, also when the resource is
   * already loaded. Concurrent calls share one read. Clears {@link getErrors} and
   * {@link getWarnings} before parsing.
   *
   * @throws Error if no `UriConverter` handles the URI, reading fails or the serializer throws.
   */
  load(): Promise<void>;

  /**
   * Writes the contents to the document.
   *
   * @throws Error if no `UriConverter` handles the URI, or writing fails.
   */
  save(): Promise<void>;

  /** Clears the contents and marks the resource as not loaded, without touching storage. */
  unload(): void;

  /** Called by the resource set when it adds or removes this resource; not for other callers. */
  eSetResourceSet(resourceSet: ResourceSet | undefined): void;
}
