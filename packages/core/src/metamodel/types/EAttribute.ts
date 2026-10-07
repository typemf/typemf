import { EDataType } from './EDataType.js';
import { EStructuralFeature } from './EStructuralFeature.js';

/** A feature whose values are data values, instances of an `EDataType`. */
export interface EAttribute extends EStructuralFeature {
  /** Whether the attribute's value identifies an instance, e.g. in references between documents. */
  isID(): boolean;
  setID(value: boolean): void;
  /** The attribute's type, as a data type. */
  getEAttributeType(): EDataType | undefined;
}
