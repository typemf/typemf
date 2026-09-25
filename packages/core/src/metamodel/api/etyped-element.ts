import { EClassifier } from './eclassifier.js';
import { ENamedElement } from './enamed-element.js';

/**
 * Base for anything that has a type and a multiplicity: structural
 * features, operations, and parameters.
 */
export interface ETypedElement extends ENamedElement {
  /** The element's type: an EClass for references, an EDataType for attributes. */
  getEType(): EClassifier | undefined;
  setEType(type: EClassifier | undefined): void;

  /** Minimum number of values. Defaults to 0. */
  getLowerBound(): number;
  setLowerBound(bound: number): void;

  /** Maximum number of values; -1 means unbounded ("*"). Defaults to 1. */
  getUpperBound(): number;
  setUpperBound(bound: number): void;

  /** upperBound === -1 || upperBound > 1 */
  isMany(): boolean;

  /** lowerBound >= 1 */
  isRequired(): boolean;

  /** Whether the order of a many-valued element's values is significant. Defaults to true. */
  isOrdered(): boolean;
  setOrdered(ordered: boolean): void;

  /**
   * Whether a many-valued element's values may not repeat. Defaults to
   * true. References are always treated as unique regardless of this flag.
   */
  isUnique(): boolean;
  setUnique(unique: boolean): void;
}
