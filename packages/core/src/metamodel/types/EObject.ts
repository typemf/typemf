import { EClass, EList, EStructuralFeature } from "../../index.js";

/**
 * The universal reflective base type. Every model instance - whether it was
 * produced by generated code or by DynamicEObjectImpl against a parsed-only
 * .ecore file - implements this interface, and it is the interface all
 * generic (reflection-driven) tooling, such as an instance editor, is
 * written against.
 */
export interface EObject {
  /** The metaclass describing this object's structure. */
  eClass(): EClass;

  /** The object containing this one, if this object is someone's child. */
  eContainer(): EObject | undefined;

  /** The containment feature this object was set/added into, if any. */
  eContainingFeature(): EStructuralFeature | undefined;

  /** Direct containment children, across every containment feature. */
  eContents(): EList<EObject>;

  /** Every containment descendant, depth-first. */
  eAllContents(): EObject[];

  /** Generic getter, dispatched by feature. */
  eGet(feature: EStructuralFeature): unknown;

  /** Generic setter, dispatched by feature. */
  eSet(feature: EStructuralFeature, value: unknown): void;

  /** Whether the feature currently holds a non-default value. */
  eIsSet(feature: EStructuralFeature): boolean;

  /** Reset the feature to its default/unset state. */
  eUnset(feature: EStructuralFeature): void;

  /**
   * Whether this object is an unresolved placeholder for an object that
   * lives in another document (see docs/dynamic-instantiation-notes.md for
   * the current, deliberately minimal, proxy story).
   */
  eIsProxy(): boolean;

  /**
   * A stable, human-readable identity string (className_idValue when an ID
   * attribute is set, otherwise a generated fallback), used as the default
   * cross-reference key during serialization.
   */
  fullId(): string;
}
