import { EClass } from './EClass.js';
import { ETypedElement } from './ETypedElement.js';
import { TypeScriptClass } from './TypeScriptClass';



export interface EStructuralFeature extends ETypedElement {

  isChangeable(): boolean;
  setChangeable(value: boolean): void;

  isVolatile(): boolean;
  setVolatile(value: boolean): void;

  isTransient(): boolean;
  setTransient(value: boolean): void;

  getDefaultValueLiteral(): string | undefined;
  setDefaultValueLiteral(value: string | undefined): void;

  getDefaultValue(): unknown;

  isUnsettable(): boolean;
  setUnsettable(value: boolean): void;

  isDerived(): boolean;
  setDerived(value: boolean): void;

  getEContainingClass(): EClass | undefined;

  getFeatureID(): number;

  getContainerClass(): TypeScriptClass<unknown> | undefined;
}
