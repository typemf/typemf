import { EClass } from './EClass.js';
import { ETypedElement } from './ETypedElement.js';
import { TypeScriptClass } from './TypeScriptClass';

/** An attribute or a reference of a class. */
export interface EStructuralFeature extends ETypedElement {
  /** Whether the value can be set. */
  isChangeable(): boolean;
  setChangeable(value: boolean): void;
  /** Whether the value is computed on access instead of stored. */
  isVolatile(): boolean;
  setVolatile(value: boolean): void;
  /** Whether the value is left out when saving. */
  isTransient(): boolean;
  setTransient(value: boolean): void;
  /** The default value in its string form, converted with the factory of the feature's type. */
  getDefaultValueLiteral(): string | undefined;
  setDefaultValueLiteral(value: string | undefined): void;
  /**
   * The value of the feature while it is unset: `defaultValueLiteral` converted to the feature's
   * type, or else the type's default value.
   */
  getDefaultValue(): unknown;
  /** Whether being unset is distinct from holding the default value. */
  isUnsettable(): boolean;
  setUnsettable(value: boolean): void;
  /** Whether the value is computed from other features. */
  isDerived(): boolean;
  setDerived(value: boolean): void;
  /** The class declaring this feature. */
  getEContainingClass(): EClass | undefined;
  /**
   * The feature's ID in the class declaring it. In a subclass, use `EClass.getFeatureID()` instead.
   */
  getFeatureID(): number;
  /** The implementation class of the class declaring this feature, if known. */
  getContainerClass(): TypeScriptClass<unknown> | undefined;
}
