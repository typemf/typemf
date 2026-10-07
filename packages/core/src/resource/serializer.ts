import { EObject } from '../metamodel/types/EObject.js';
import { Resource } from './resource.js';

/**
 * A persistence format, such as JSON or XMI. A `ResourceFactory` creates resources that
 * read and write through one serializer.
 */
export interface EObjectSerializer {
  /**
   * Encodes `roots`. `resource` provides the document's URI, used to write references to objects
   * in other documents relative to it.
   */
  serialize(roots: EObject[], resource: Resource): Promise<Uint8Array>;

  /**
   * Decodes `content` into root objects, looking up classes in the package registry of
   * `resource`'s resource set. Problems that leave the rest of the document usable are recorded
   * in `resource.getErrors()`/`getWarnings()` rather than thrown.
   */
  deserialize(content: Uint8Array, resource: Resource): Promise<EObject[]>;

  /**
   * The nsURIs of the packages `content` declares, without needing them to be registered, so a
   * caller can check before loading which packages are missing. May include declared packages
   * that no object uses.
   */
  peekReferencedNsURIs(content: Uint8Array): Promise<string[]>;

  /**
   * The fragment that addresses `target` among `roots` in this format. Optional: without it, the
   * default grammar of `computeFragment()` is used. References into a document always use the
   * grammar of the format that document is stored in.
   */
  computeFragment?(target: EObject, roots: EObject[]): string;

  /** The object `fragment` addresses among `roots`; the counterpart of {@link computeFragment}. */
  resolveFragment?(fragment: string, roots: EObject[]): EObject | undefined;
}
