import {
  EClass,
  EDataType,
  EModelElement,
  EObject,
  EPackage,
} from "../../index.js";

export interface EFactory extends EModelElement {
  getEPackage(): EPackage | undefined;
  setEPackage(value: EPackage | undefined): void;

  create(eClass: EClass): EObject;

  createFromString(eDataType: EDataType, literalValue: string): unknown;

  convertToString(eDataType: EDataType, instanceValue: unknown): string;
}
