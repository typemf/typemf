import { EClassifier } from './EClassifier.js';

/** A type whose instances are plain values, such as strings and numbers, not model objects. */
export interface EDataType extends EClassifier {
  /** Whether values of this type can be converted to and from strings for saving. */
  isSerializable(): boolean;
  setSerializable(value: boolean): void;
}
