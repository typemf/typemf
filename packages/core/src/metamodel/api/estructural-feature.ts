import { EClass } from './eclass.js';
import { ETypedElement } from './etyped-element.js';

/**
 * Base for EAttribute and EReference - anything eGet/eSet can dispatch on.
 *
 * The changeable/volatile/transient/derived/unsettable flags are recorded
 * metadata with EMF's meaning; eSet/eGet don't enforce them yet.
 */
export interface EStructuralFeature extends ETypedElement {
  /**
   * Stable per-EClass id used as the eGet/eSet dispatch key. Must be unique
   * across the class's declared and inherited features. -1 until set.
   */
  getFeatureID(): number;
  setFeatureID(id: number): void;

  /** The class that declares this feature. */
  getEContainingClass(): EClass | undefined;
  setEContainingClass(owner: EClass | undefined): void;

  /** Whether the value may be modified. Defaults to true. */
  isChangeable(): boolean;
  setChangeable(changeable: boolean): void;

  /** Whether the value is computed on every access rather than stored. Defaults to false. */
  isVolatile(): boolean;
  setVolatile(volatile: boolean): void;

  /** Whether the value is excluded from serialization. Defaults to false. */
  isTransient(): boolean;
  setTransient(transient: boolean): void;

  /** Whether the value is derived from other features. Defaults to false. */
  isDerived(): boolean;
  setDerived(derived: boolean): void;

  /**
   * Whether "unset" is a state distinct from holding the default value.
   * Defaults to false.
   */
  isUnsettable(): boolean;
  setUnsettable(unsettable: boolean): void;
}
