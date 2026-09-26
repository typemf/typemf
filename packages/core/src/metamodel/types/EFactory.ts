import { EClass, EDataType, EObject, EList } from "./index.js";
import { EModelElement } from "./EModelElement.js";
import { EPackage } from "./EPackage.js";

export interface EFactory extends EModelElement {
  getEPackage(): EPackage | undefined;
  setEPackage(value: EPackage | undefined): void;

  create(eClass: EClass): EObject;

  createFromString(eDataType: EDataType, literalValue: string): unknown;

  convertToString(eDataType: EDataType, instanceValue: unknown): string;
}
