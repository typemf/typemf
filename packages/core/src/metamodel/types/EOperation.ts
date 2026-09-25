import {
  EClass,
  EClassifier,
  EGenericType,
  EList,
  EParameter,
  ETypedElement,
  ETypeParameter,
} from "../../index.js";

export interface EOperation extends ETypedElement {
  getEContainingClass(): EClass | undefined;
  setEContainingClass(value: EClass | undefined): void;

  getETypeParameters(): EList<ETypeParameter>;

  getEParameters(): EList<EParameter>;

  getEExceptions(): EList<EClassifier>;

  getEGenericExceptions(): EList<EGenericType>;

  getOperationID(): number;

  isOverrideOf(someOperation: EOperation): boolean;
}
