import { EAttribute } from './EAttribute.js';
import { EClass } from './EClass.js';
import { EList } from './EList.js';
import { EStructuralFeature } from './EStructuralFeature.js';

/** A feature whose values are model objects. */
export interface EReference extends EStructuralFeature {
  /**
   * Whether the referenced objects are contained: each object has at most one container and is
   * saved with it.
   */
  isContainment(): boolean;
  setContainment(value: boolean): void;
  /** Whether this reference points to the container, i.e. its opposite is a containment. */
  isContainer(): boolean;
  /** Whether values may be proxies for objects in other documents. */
  isResolveProxies(): boolean;
  setResolveProxies(value: boolean): void;
  /**
   * The reference in the other direction. Both ends are kept consistent: changing one updates the
   * other.
   */
  getEOpposite(): EReference | undefined;
  setEOpposite(value: EReference | undefined): void;
  /** The reference's type, as a class. */
  getEReferenceType(): EClass | undefined;
  /** Attributes of the referenced objects that identify them within this reference. */
  getEKeys(): EList<EAttribute>;
}
