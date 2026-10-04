import { EDataType } from './EDataType.js';
import { EStructuralFeature } from './EStructuralFeature.js';

export interface EAttribute extends EStructuralFeature {
  isID(): boolean;
  setID(value: boolean): void;

  getEAttributeType(): EDataType | undefined;
}
