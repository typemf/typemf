import {
  EAttribute,
  EClassifier,
  EGenericType,
  EList,
  EOperation,
  EReference,
  EStructuralFeature,
} from "../../index.js";

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
}
