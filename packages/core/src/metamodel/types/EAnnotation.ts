import { EList } from './EList.js';
import { EModelElement } from './EModelElement.js';
import { EObject } from './EObject.js';
import { EStringToStringMapEntry } from './EStringToStringMapEntry.js';

/**
 * Additional information attached to a model element: a source URI identifying the kind of
 * information, string details, and optional contained or referenced objects.
 */
export interface EAnnotation extends EModelElement {
  /** A URI identifying the kind of annotation, e.g. `https://typemf.dev/generator`. */
  getSource(): string | undefined;
  setSource(value: string | undefined): void;
  /**
   * The annotation's key-value pairs. Read and write them with `detailValue()` and
   * `setDetailValue()`.
   */
  getDetails(): EList<EStringToStringMapEntry>;
  /** The element this annotation is attached to. */
  getEModelElement(): EModelElement | undefined;
  setEModelElement(value: EModelElement | undefined): void;
  /** Objects contained by the annotation. */
  getContents(): EList<EObject>;
  /** Objects referenced by the annotation. */
  getReferences(): EList<EObject>;
}
