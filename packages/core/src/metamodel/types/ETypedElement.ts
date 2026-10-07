import { EClassifier } from './EClassifier.js';
import { EGenericType } from './EGenericType.js';
import { ENamedElement } from './ENamedElement.js';

/** An element with a type and a multiplicity: a feature, an operation or a parameter. */
export interface ETypedElement extends ENamedElement {
  /** Whether the order of the values is significant. */
  isOrdered(): boolean;
  setOrdered(value: boolean): void;
  /** Whether each value occurs at most once. */
  isUnique(): boolean;
  setUnique(value: boolean): void;
  /** The minimum number of values. */
  getLowerBound(): number;
  setLowerBound(value: number): void;
  /** The maximum number of values; -1 means unbounded. */
  getUpperBound(): number;
  setUpperBound(value: number): void;
  /** Whether the element can hold more than one value: `upperBound` is -1 or greater than 1. */
  isMany(): boolean;
  /** Whether at least one value is required: `lowerBound` is 1 or more. */
  isRequired(): boolean;
  /** The element's type. */
  getEType(): EClassifier | undefined;
  setEType(value: EClassifier | undefined): void;
  /** The element's type, with its type arguments. */
  getEGenericType(): EGenericType | undefined;
  setEGenericType(value: EGenericType | undefined): void;
}
