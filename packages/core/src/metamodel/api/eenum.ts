import { EDataType } from './edata-type.js';
import { EEnumLiteral } from './eenum-literal.js';
import { EList } from './elist.js';

/** A data type whose values are restricted to a fixed set of named literals. */
export interface EEnum extends EDataType {
  /**
   * The enum's literals, in declaration order. Adding to this list directly
   * does not set the literal's owning EEnum; EEnumImpl.addLiteral() does.
   */
  getELiterals(): EList<EEnumLiteral>;

  /** Looks up a literal by its name (not its `literal` string). */
  getEEnumLiteral(name: string): EEnumLiteral | undefined;

  /** Looks up a literal by its integer value. */
  getEEnumLiteralByValue(value: number): EEnumLiteral | undefined;
}
