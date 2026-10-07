import { EAttribute } from './EAttribute.js';
import { EClassifier } from './EClassifier.js';
import { EGenericType } from './EGenericType.js';
import { EList } from './EList.js';
import { EOperation } from './EOperation.js';
import { EReference } from './EReference.js';
import { EStructuralFeature } from './EStructuralFeature.js';

/** A class: the features, operations and supertypes its instances share. */
export interface EClass extends EClassifier {
  /** Whether the class cannot have direct instances. */
  isAbstract(): boolean;
  setAbstract(value: boolean): void;
  /** Whether the class only declares a type. An interface is also abstract. */
  isInterface(): boolean;
  setInterface(value: boolean): void;
  /** The direct supertypes. */
  getESuperTypes(): EList<EClass>;
  /** The operations declared by this class, not including inherited ones. */
  getEOperations(): EList<EOperation>;
  /** All attributes, inherited ones included, in the order of `eAllStructuralFeatures`. */
  getEAllAttributes(): EList<EAttribute>;
  /** All references, inherited ones included, in the order of `eAllStructuralFeatures`. */
  getEAllReferences(): EList<EReference>;
  /** The references declared by this class, not including inherited ones. */
  getEReferences(): EList<EReference>;
  /** The attributes declared by this class, not including inherited ones. */
  getEAttributes(): EList<EAttribute>;
  /** All containment references, inherited ones included. */
  getEAllContainments(): EList<EReference>;
  /**
   * All operations, inherited ones included: those of the supertypes first, then the class's own,
   * each once.
   */
  getEAllOperations(): EList<EOperation>;
  /**
   * All features, inherited ones included: those of the supertypes first, then the class's own,
   * each once. A feature's index in this list is its ID in this class (see `getFeatureID`).
   */
  getEAllStructuralFeatures(): EList<EStructuralFeature>;
  /**
   * All direct and indirect supertypes, not including this class. Each supertype comes after its
   * own supertypes.
   */
  getEAllSuperTypes(): EList<EClass>;
  /** The first ID attribute (see `EAttribute.isID()`) in `eAllAttributes`, if any. */
  getEIDAttribute(): EAttribute | undefined;
  /** The features declared by this class, not including inherited ones. */
  getEStructuralFeatures(): EList<EStructuralFeature>;
  /** The direct supertypes, with their type arguments. */
  getEGenericSuperTypes(): EList<EGenericType>;
  /** All direct and indirect supertypes, with their type arguments. */
  getEAllGenericSuperTypes(): EList<EGenericType>;
  /** Whether this class is `someClass` or one of its direct or indirect supertypes. */
  isSuperTypeOf(someClass: EClass): boolean;
  /** The number of features, inherited ones included. */
  getFeatureCount(): number;
  /**
   * The feature with the ID `featureID`, i.e. at that index in `eAllStructuralFeatures`, if any.
   */
  getEStructuralFeature(featureID: number): EStructuralFeature | undefined;
  /**
   * The ID of `feature` in this class: its index in `eAllStructuralFeatures`, or -1 if the class
   * has no such feature.
   */
  getFeatureID(feature: EStructuralFeature): number;
  /** The feature named `featureName`, inherited ones included, if any. */
  getEStructuralFeature(featureName: string): EStructuralFeature | undefined;
  /** The number of operations, inherited ones included. */
  getOperationCount(): number;
  /** The operation in `eAllOperations` whose ID is `operationID`, if any. */
  getEOperation(operationID: number): EOperation | undefined;
  /** The ID of `operation`, see `EOperation.getOperationID()`. */
  getOperationID(operation: EOperation): number;
  /**
   * The operation of this class that overrides `operation`, declared in a supertype, if any (see
   * `EOperation.isOverrideOf()`). `undefined` if `operation` is declared in this class.
   */
  getOverride(operation: EOperation): EOperation | undefined;
}
