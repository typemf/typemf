import { EAttribute } from './eattribute.js';
import { EClassifier } from './eclassifier.js';
import { EList } from './elist.js';
import { EObject } from './eobject.js';
import { EOperation } from './eoperation.js';
import { EReference } from './ereference.js';
import { EStructuralFeature } from './estructural-feature.js';

/** A metaclass: describes the features, operations and supertypes of model objects. */
export interface EClass extends EClassifier {
  /**
   * Direct supertypes. Live - add to it to declare inheritance, then call
   * recomputeAllLists().
   */
  getESuperTypes(): EList<EClass>;

  /** Features declared directly on this class (not inherited). */
  getEStructuralFeatures(): EList<EStructuralFeature>;

  /** Declared attributes only. A fresh snapshot - adding to it has no effect on the class. */
  getEAttributes(): EList<EAttribute>;

  /** Declared references only. A fresh snapshot - adding to it has no effect on the class. */
  getEReferences(): EList<EReference>;

  /** Operations declared directly on this class (not inherited). */
  getEOperations(): EList<EOperation>;

  /** Declared + inherited, supertypes first. */
  getEAllStructuralFeatures(): EStructuralFeature[];

  /** Declared + inherited attributes, in getEAllStructuralFeatures() order. */
  getEAllAttributes(): EAttribute[];

  /** Declared + inherited references, in getEAllStructuralFeatures() order. */
  getEAllReferences(): EReference[];

  /** Declared + inherited references with isContainment() set. */
  getEAllContainments(): EReference[];

  /** Declared + inherited operations, supertypes first. */
  getEAllOperations(): EOperation[];

  /** Every transitive supertype, each listed once, most general first. Excludes this class. */
  getEAllSuperTypes(): EClass[];

  /** Looks up a declared or inherited feature by its feature id. */
  getEStructuralFeature(featureID: number): EStructuralFeature | undefined;

  /** Looks up a declared or inherited feature by name. */
  getEStructuralFeatureByName(name: string): EStructuralFeature | undefined;

  /** Whether the class is abstract. An abstract class can't be instantiated via createInstance(). */
  isAbstract(): boolean;
  setAbstract(isAbstract: boolean): void;

  /** Whether the class is an interface. An interface can't be instantiated via createInstance(). */
  isInterface(): boolean;
  setInterface(isInterface: boolean): void;

  /** Whether `other` is this class or inherits from it, directly or transitively. */
  isSuperTypeOf(other: EClass): boolean;

  /** Recomputes the getEAll*() caches; call after changing eSuperTypes. */
  recomputeAllLists(): void;

  /**
   * Convenience for `eClass.getEPackage().getEFactoryInstance().create(eClass)`.
   * On a fully dynamic (parsed-only) EPackage this resolves to
   * DynamicEFactoryImpl automatically - see epackage-impl.ts.
   *
   * @throws if the owning package has no factory registered, or if the
   *   class is abstract or an interface.
   */
  createInstance(): EObject;
}
