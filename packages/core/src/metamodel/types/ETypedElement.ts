import { ENamedElement } from "./ENamedElement.js";
import { EClassifier } from "./EClassifier.js";
import { EGenericType } from "./EGenericType.js";

export interface ETypedElement extends ENamedElement {
  isOrdered(): boolean | undefined;
  setOrdered(value: boolean | undefined): void;

  isUnique(): boolean | undefined;
  setUnique(value: boolean | undefined): void;

  getLowerBound(): number | undefined;
  setLowerBound(value: number | undefined): void;

  getUpperBound(): number | undefined;
  setUpperBound(value: number | undefined): void;

  isMany(): boolean | undefined;

  isRequired(): boolean | undefined;

  getEType(): EClassifier | undefined;
  setEType(value: EClassifier | undefined): void;

  getEGenericType(): EGenericType | undefined;
  setEGenericType(value: EGenericType | undefined): void;
}
