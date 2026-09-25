import { EAnnotation } from './eannotation.js';
import { EList } from './elist.js';
import { EObject } from './eobject.js';

/**
 * Base type for every metamodel construct (EClass, EAttribute, EPackage,
 * ...). This was an empty marker interface in the original TMF - the only
 * thing it adds here is annotation support, which the original had no
 * equivalent of at all.
 */
export interface EModelElement extends EObject {
  /** All annotations attached to this element. Live - add to it to attach one. */
  getEAnnotations(): EList<EAnnotation>;

  /** Looks up an annotation by its `source` URI, e.g. "http://typemf.dev/ui". */
  getEAnnotation(source: string): EAnnotation | undefined;
}
