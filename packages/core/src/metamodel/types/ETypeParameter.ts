import { EGenericType } from './EGenericType.js';
import { EList } from './EList.js';
import { ENamedElement } from './ENamedElement.js';

/** A type parameter of a classifier or an operation. */
export interface ETypeParameter extends ENamedElement {
  /** The bounds a type argument must satisfy. */
  getEBounds(): EList<EGenericType>;
}
