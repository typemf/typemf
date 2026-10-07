import { EAnnotation } from './EAnnotation.js';
import { EList } from './EList.js';
import { EObject } from './EObject.js';

/** The base of every metamodel element. It can carry annotations. */
export interface EModelElement extends EObject {
  /** The annotations attached to this element. */
  getEAnnotations(): EList<EAnnotation>;
  /** The first annotation whose `source` is `source`, if any. */
  getEAnnotation(source: string): EAnnotation | undefined;
}
