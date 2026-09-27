import { EObject } from './EObject.js';
import { EList } from './EList.js';
import { EClassifier } from './EClassifier.js';
import { EOperation } from './EOperation.js';
import { EAttribute } from './EAttribute.js';
import { EReference } from './EReference.js';
import { EStructuralFeature } from './EStructuralFeature.js';
import { EGenericType } from './EGenericType.js';


export interface EClass extends EClassifier {

  isAbstract(): boolean;
  setAbstract(value: boolean): void;

  isInterface(): boolean;
  setInterface(value: boolean): void;

  getESuperTypes(): EList<EClass>;

  getEOperations(): EList<EOperation>;

  getEAllAttributes(): EList<EAttribute>;

  getEAllReferences(): EList<EReference>;

  getEReferences(): EList<EReference>;

  getEAttributes(): EList<EAttribute>;

  getEAllContainments(): EList<EReference>;

  getEAllOperations(): EList<EOperation>;

  getEAllStructuralFeatures(): EList<EStructuralFeature>;

  getEAllSuperTypes(): EList<EClass>;

  getEIDAttribute(): EAttribute | undefined;
  setEIDAttribute(value: EAttribute | undefined): void;

  getEStructuralFeatures(): EList<EStructuralFeature>;

  getEGenericSuperTypes(): EList<EGenericType>;

  getEAllGenericSuperTypes(): EList<EGenericType>;

  isSuperTypeOf(someClass: EClass): boolean;

  getFeatureCount(): number;

  getEStructuralFeature(featureID: number): EStructuralFeature | undefined;

  getFeatureID(feature: EStructuralFeature): number;

  getEStructuralFeature(featureName: string): EStructuralFeature | undefined;

  getOperationCount(): number;

  getEOperation(operationID: number): EOperation | undefined;

  getOperationID(operation: EOperation): number;

  getOverride(operation: EOperation): EOperation | undefined;
}
