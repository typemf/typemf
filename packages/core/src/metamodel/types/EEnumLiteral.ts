import { EEnum } from './EEnum.js';
import { ENamedElement } from './ENamedElement.js';
import { EEnumerator } from './EEnumerator';

/** One value of an enumeration. */
export interface EEnumLiteral extends ENamedElement {
  /** The literal's numeric value. */
  getValue(): number;
  setValue(value: number): void;
  /** The implementation value of the literal, if any. */
  getInstance(): EEnumerator | undefined;
  setInstance(value: EEnumerator | undefined): void;
  /** The literal's string form used in documents. Defaults to its name. */
  getLiteral(): string | undefined;
  setLiteral(value: string | undefined): void;
  /** The enumeration this literal belongs to. */
  getEEnum(): EEnum | undefined;
}
