import { EList } from "../metamodel/types/EList.js";
import { EObject } from "../metamodel/types/EObject.js";
import { Diagnostic } from "./diagnostic.js";
import { EObjectSerializer } from "./serializer.js";
import { ResourceSet } from "./resource-set.js";
import { URI } from "./uri.js";

/**
 * A loaded (or loadable) document: a URI, its root EObject(s), and
 * load()/save() delegating to an injected EObjectSerializer. Maps to EMF's
 * org.eclipse.emf.ecore.resource.Resource.
 */
export interface Resource {
  getURI(): URI;
  setURI(uri: URI): void;

  /** Root objects. Most documents have exactly one; some formats allow many. */
  getContents(): EList<EObject>;

  getResourceSet(): ResourceSet | undefined;

  getErrors(): Diagnostic[];
  getWarnings(): Diagnostic[];

  isLoaded(): boolean;

  /** The format this resource reads/writes through - see EObjectSerializer. */
  getSerializer(): EObjectSerializer;

  /** Reads and deserializes via the injected UriConverter/EObjectSerializer. */
  load(): Promise<void>;

  /** Serializes and writes back via the injected UriConverter/EObjectSerializer. */
  save(): Promise<void>;

  /** Clears getContents() and resets isLoaded() to false, without touching storage. */
  unload(): void;

  /**
   * Internal - called by ResourceSetImpl when a Resource is added to or
   * removed from a set. Not part of the API a consumer calls directly.
   */
  eSetResourceSet(resourceSet: ResourceSet | undefined): void;
}
