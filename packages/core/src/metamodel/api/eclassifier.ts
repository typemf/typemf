import { ENamedElement } from './enamed-element.js';
import { EPackage } from './epackage.js';

/** Common base of EClass and EDataType: anything that can be used as a type. */
export interface EClassifier extends ENamedElement {
  /**
   * The package this classifier belongs to. Not set automatically when the
   * classifier is added to EPackage.getEClassifiers() - call setEPackage() too.
   */
  getEPackage(): EPackage | undefined;
  setEPackage(pkg: EPackage | undefined): void;

  /**
   * Numeric id used for fast dispatch, e.g. by generated factories. -1
   * until set; nothing assigns it automatically.
   */
  getClassifierID(): number;
  setClassifierID(id: number): void;

  /**
   * Whether `value` is a valid instance of this classifier. For an EClass,
   * that means an EObject whose eClass() is this class or a subclass.
   */
  isInstance(value: unknown): boolean;
}
