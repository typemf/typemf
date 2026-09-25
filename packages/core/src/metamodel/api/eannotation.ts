import { EModelElement } from "./emodel-element.js";

/**
 * Arbitrary, source-namespaced metadata attachable to any EModelElement.
 * Mirrors EMF's EAnnotation. `details` is a plain string-to-string map.
 */
export interface EAnnotation extends EModelElement {
  /**
   * The URI identifying who this annotation is for, e.g.
   * "http://typemf.dev/ui". Used as the lookup key by
   * EModelElement.getEAnnotation().
   */
  getSource(): string | undefined;
  setSource(source: string): void;

  /** The annotation's key/value pairs. Live - mutate the returned map directly. */
  getDetails(): Map<string, string>;

  /** The element this annotation is attached to, if any. */
  getEModelElement(): EModelElement | undefined;
}
