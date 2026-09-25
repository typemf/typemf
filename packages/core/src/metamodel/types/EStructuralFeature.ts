import { ETypedElement } from "./ETypedElement.js";
import { EClass } from "./EClass.js";

export interface EStructuralFeature extends ETypedElement {
  getChangeable(): boolean | undefined;
  setChangeable(value: boolean | undefined): void;

  getVolatile(): boolean | undefined;
  setVolatile(value: boolean | undefined): void;

  getTransient(): boolean | undefined;
  setTransient(value: boolean | undefined): void;

  getDefaultValueLiteral(): string | undefined;
  setDefaultValueLiteral(value: string | undefined): void;

  getDefaultValue(): unknown | undefined;
  setDefaultValue(value: unknown | undefined): void;

  getUnsettable(): boolean | undefined;
  setUnsettable(value: boolean | undefined): void;

  getDerived(): boolean | undefined;
  setDerived(value: boolean | undefined): void;

  getEContainingClass(): EClass | undefined;
  setEContainingClass(value: EClass | undefined): void;

  getFeatureID(): number;

  getContainerClass(): EClass;
}
