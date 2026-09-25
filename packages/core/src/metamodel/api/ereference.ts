import { EStructuralFeature } from './estructural-feature.js';

/** A structural feature whose values are other model objects (typed by an EClass). */
export interface EReference extends EStructuralFeature {
  /**
   * Whether referenced objects are owned by the referencing object. Adding
   * an object to a containment reference sets its eContainer() and removes
   * it from its previous container.
   */
  isContainment(): boolean;
  setContainment(containment: boolean): void;

  /**
   * The reference on the target class that points back, for bidirectional
   * references. Changing one side updates the other automatically. Set it
   * on both references (a reference may also be its own opposite).
   */
  getEOpposite(): EReference | undefined;
  setEOpposite(opposite: EReference | undefined): void;

  /**
   * Whether a value that is an unresolved proxy should be transparently
   * resolved on eGet. Deliberately unimplemented in this initial version -
   * see docs/dynamic-instantiation-notes.md.
   */
  isResolveProxies(): boolean;
  setResolveProxies(resolve: boolean): void;
}
