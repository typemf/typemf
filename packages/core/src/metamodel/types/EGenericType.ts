import { EClassifier } from './EClassifier.js';
import { EList } from './EList.js';
import { EObject } from './EObject.js';
import { ETypeParameter } from './ETypeParameter.js';

/**
 * A use of a type: a classifier with type arguments, a type parameter, or a wildcard with bounds.
 */
export interface EGenericType extends EObject {
  /** The upper bound of a wildcard (`? extends T`). */
  getEUpperBound(): EGenericType | undefined;
  setEUpperBound(value: EGenericType | undefined): void;
  /** The type arguments. */
  getETypeArguments(): EList<EGenericType>;
  /**
   * The classifier this type erases to: its classifier, else the first bound of its type parameter,
   * else its upper bound, else `EJavaObject`.
   */
  getERawType(): EClassifier | undefined;
  /** The lower bound of a wildcard (`? super T`). */
  getELowerBound(): EGenericType | undefined;
  setELowerBound(value: EGenericType | undefined): void;
  /** The type parameter this type refers to, if any. */
  getETypeParameter(): ETypeParameter | undefined;
  setETypeParameter(value: ETypeParameter | undefined): void;
  /** The classifier this type refers to, if any. */
  getEClassifier(): EClassifier | undefined;
  setEClassifier(value: EClassifier | undefined): void;
}
