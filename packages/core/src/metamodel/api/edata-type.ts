import { EClassifier } from './eclassifier.js';

/** Marker for primitive/value classifiers (EString, EInt, EBoolean, ...). */
export interface EDataType extends EClassifier {
  /**
   * Whether values of this type can be converted to and from strings
   * (via EFactory.convertToString/createFromString) for serialization.
   * Defaults to true.
   */
  isSerializable(): boolean;
  setSerializable(serializable: boolean): void;
}
