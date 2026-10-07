import { EDataType } from './EDataType.js';
import { EEnumLiteral } from './EEnumLiteral.js';
import { EList } from './EList.js';

/** A data type whose values are a fixed set of literals. */
export interface EEnum extends EDataType {
  /** The literals of this enumeration. */
  getELiterals(): EList<EEnumLiteral>;
  /** The literal named `name`, if any. */
  getEEnumLiteral(name: string): EEnumLiteral | undefined;
  /** The literal with the numeric value `value`, if any. */
  getEEnumLiteral(value: number): EEnumLiteral | undefined;
  /** The literal whose string form (see `EEnumLiteral.getLiteral()`) is `literal`, if any. */
  getEEnumLiteralByLiteral(literal: string): EEnumLiteral | undefined;
}
