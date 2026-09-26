import { TypeScriptClass } from "./index.js";
import { ETypedElement } from "./ETypedElement.js";
import { EClass } from "./EClass.js";

export interface EStructuralFeature extends ETypedElement {
  isChangeable(): boolean;
  setChangeable(value: boolean): void;

  isVolatile(): boolean;
  setVolatile(value: boolean): void;

  isTransient(): boolean;
  setTransient(value: boolean): void;

  getDefaultValueLiteral(): string | undefined;
  setDefaultValueLiteral(value: string | undefined): void;

  getDefaultValue(): unknown | undefined;
  setDefaultValue(value: unknown | undefined): void;

  isUnsettable(): boolean;
  setUnsettable(value: boolean): void;

  isDerived(): boolean;
  setDerived(value: boolean): void;

  getEContainingClass(): EClass | undefined;
  setEContainingClass(value: EClass | undefined): void;

  getFeatureID(): number;

  getContainerClass(): TypeScriptClass<unknown> | undefined;
}
