import { EList, ENamedElement, EPackage, ETypeParameter } from "../../index.js";

export interface EClassifier extends ENamedElement {
  getInstanceClassName(): string | undefined;
  setInstanceClassName(value: string | undefined): void;

  getInstanceClass(): EJavaClass | undefined;
  setInstanceClass(value: EJavaClass | undefined): void;

  getDefaultValue(): EJavaObject | undefined;
  setDefaultValue(value: EJavaObject | undefined): void;

  getInstanceTypeName(): string | undefined;
  setInstanceTypeName(value: string | undefined): void;

  getEPackage(): EPackage | undefined;
  setEPackage(value: EPackage | undefined): void;

  getETypeParameters(): EList<ETypeParameter>;

  isInstance(object: EJavaObject): boolean;

  getClassifierID(): number;
}
