import { EList, ENamedElement, EPackage, ETypeParameter } from "../../index.js";

export interface EClassifier extends ENamedElement {
  getDefaultValue(): unknown | undefined;
  setDefaultValue(value: unknown | undefined): void;

  getInstanceTypeName(): string | undefined;
  setInstanceTypeName(value: string | undefined): void;

  getEPackage(): EPackage | undefined;
  setEPackage(value: EPackage | undefined): void;

  getETypeParameters(): EList<ETypeParameter>;

  isInstance(object: any): boolean;

  getClassifierID(): number;
}
