import { EDataType, EStructuralFeature } from "../../index.js";

export interface EAttribute extends EStructuralFeature {
  isID(): boolean;
  setID(value: boolean): void;

  getEAttributeType(): EDataType | undefined;
  setEAttributeType(value: EDataType | undefined): void;
}
