import { EObject } from './EObject.js';

/** A key-value pair of strings, the type of an annotation's details. */
export interface EStringToStringMapEntry extends EObject {
  /** The entry's key. */
  getKey(): string | undefined;
  setKey(value: string | undefined): void;
  /** The entry's value. */
  getValue(): string | undefined;
  setValue(value: string | undefined): void;
}
