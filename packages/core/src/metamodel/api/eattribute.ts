import { EStructuralFeature } from './estructural-feature.js';

/** A structural feature whose values are data (typed by an EDataType), not objects. */
export interface EAttribute extends EStructuralFeature {
  /**
   * Whether this attribute identifies its owning object. EObject.fullId()
   * uses the first ID attribute it finds, if set, instead of a generated
   * fallback.
   */
  isID(): boolean;
  setID(isID: boolean): void;
}
