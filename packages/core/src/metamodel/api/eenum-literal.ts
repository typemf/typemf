import { EEnum } from './eenum.js';
import { ENamedElement } from './enamed-element.js';

/** One named constant of an EEnum. */
export interface EEnumLiteral extends ENamedElement {
  /** The literal's integer value. Defaults to 0. */
  getValue(): number;
  setValue(value: number): void;

  /** The serialized textual form; defaults to `getName()` if never set. */
  getLiteral(): string;
  setLiteral(literal: string): void;

  /** The enum this literal belongs to, if it has been added to one. */
  getEEnum(): EEnum | undefined;
}
