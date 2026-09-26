import { EObject, EList } from "./index.js";
import { ENamedElement } from "./ENamedElement.js";
import { EPackage } from "./EPackage.js";
import { ETypeParameter } from "./ETypeParameter.js";

export interface EClassifier extends ENamedElement {
  getInstanceClassName(): string | undefined;
  setInstanceClassName(value: string | undefined): void;

  getInstanceClass(): EJavaClass | undefined;
  setInstanceClass(value: EJavaClass | undefined): void;

  getDefaultValue(): unknown | undefined;
  setDefaultValue(value: unknown | undefined): void;

  getInstanceTypeName(): string | undefined;
  setInstanceTypeName(value: string | undefined): void;

  getEPackage(): EPackage | undefined;
  setEPackage(value: EPackage | undefined): void;

  getETypeParameters(): EList<ETypeParameter>;

  isInstance(object: unknown): boolean;

  getClassifierID(): number;
}
