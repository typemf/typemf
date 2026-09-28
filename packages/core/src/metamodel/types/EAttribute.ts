import { EStructuralFeature } from './EStructuralFeature.js';
import { EDataType } from './EDataType.js';


export interface EAttribute extends EStructuralFeature {

  isID(): boolean;
  setID(value: boolean): void;

  getEAttributeType(): EDataType | undefined;
  setEAttributeType(value: EDataType | undefined): void;
}
