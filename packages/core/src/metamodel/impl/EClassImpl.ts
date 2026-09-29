import { EClassifierImpl } from './EClassifierImpl.js';
import { EObjectImpl } from './EObjectImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EAttribute } from '../types/EAttribute.js';
import { EClass } from '../types/EClass.js';
import { EGenericType } from '../types/EGenericType.js';
import { EList } from '../types/EList.js';
import { EOperation } from '../types/EOperation.js';
import { EReference } from '../types/EReference.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { isEAttribute, isEClass, isEReference } from '../util/EcoreTypeGuards.js';
import { BasicEList } from './BasicEList.js';
import { EGenericTypeImpl } from './EGenericTypeImpl.js';
import { EOperationImpl } from './EOperationImpl';
import { EStructuralFeatureImpl } from './EStructuralFeatureImpl';



export class EClassImpl extends EClassifierImpl implements EClass {

  private _abstract: boolean = false;

  private _interface: boolean = false;

  private _eSuperTypesCache: BasicEList<EClass> | undefined;

  private get _eSuperTypes(): BasicEList<EClass> {
    if (!this._eSuperTypesCache) {
      this._eSuperTypesCache = new BasicEList<EClass>(this, getEcorePackageRef().getEClass_ESuperTypes());
    }
    return this._eSuperTypesCache;
  }

  private _eOperationsCache: BasicEList<EOperation> | undefined;

  private get _eOperations(): BasicEList<EOperation> {
    if (!this._eOperationsCache) {
      this._eOperationsCache = new BasicEList<EOperation>(this, getEcorePackageRef().getEClass_EOperations());
    }
    return this._eOperationsCache;
  }


  private _eAllAttributesCache: EList<EAttribute> | undefined;
  private _eAllAttributesCacheGeneration = -1;


  private _eAllReferencesCache: EList<EReference> | undefined;
  private _eAllReferencesCacheGeneration = -1;


  private _eReferencesCache: EList<EReference> | undefined;
  private _eReferencesCacheGeneration = -1;


  private _eAttributesCache: EList<EAttribute> | undefined;
  private _eAttributesCacheGeneration = -1;


  private _eAllContainmentsCache: EList<EReference> | undefined;
  private _eAllContainmentsCacheGeneration = -1;


  private _eAllOperationsCache: EList<EOperation> | undefined;
  private _eAllOperationsCacheGeneration = -1;


  private _eAllStructuralFeaturesCache: EList<EStructuralFeature> | undefined;
  private _eAllStructuralFeaturesCacheGeneration = -1;


  private _eAllSuperTypesCache: EList<EClass> | undefined;
  private _eAllSuperTypesCacheGeneration = -1;

  private _eIDAttributeCache: EAttribute | undefined;
  private _eIDAttributeCacheGeneration = -1;

  private _eStructuralFeaturesCache: BasicEList<EStructuralFeature> | undefined;

  private get _eStructuralFeatures(): BasicEList<EStructuralFeature> {
    if (!this._eStructuralFeaturesCache) {
      this._eStructuralFeaturesCache = new BasicEList<EStructuralFeature>(this, getEcorePackageRef().getEClass_EStructuralFeatures());
    }
    return this._eStructuralFeaturesCache;
  }

  private _eGenericSuperTypesCache: BasicEList<EGenericType> | undefined;

  private get _eGenericSuperTypes(): BasicEList<EGenericType> {
    if (!this._eGenericSuperTypesCache) {
      this._eGenericSuperTypesCache = new BasicEList<EGenericType>(this, getEcorePackageRef().getEClass_EGenericSuperTypes());
    }
    return this._eGenericSuperTypesCache;
  }


  private _eAllGenericSuperTypesCache: EList<EGenericType> | undefined;
  private _eAllGenericSuperTypesCacheGeneration = -1;


  eClass(): EClass {
    return getEcorePackageRef().getEClass();
  }

  isAbstract(): boolean {
    return this._abstract;
  }
  setAbstract(value: boolean): void {
    this.eSet(getEcorePackageRef().getEClass_Abstract(), value);
  }
  isInterface(): boolean {
    return this._interface;
  }
  setInterface(value: boolean): void {
    this.eSet(getEcorePackageRef().getEClass_Interface(), value);
  }
  getESuperTypes(): EList<EClass> {
    return this._eSuperTypes;
  }
  getEOperations(): EList<EOperation> {
    return this._eOperations;
  }
  getEAllAttributes(): EList<EAttribute> {
    if (this._eAllAttributesCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eAllAttributesCache = (() => {
        return new BasicEList<EAttribute>(undefined, undefined, this.getEAllStructuralFeatures().filter(isEAttribute) as EAttribute[]);
      })();
      this._eAllAttributesCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eAllAttributesCache!;
  }
  getEAllReferences(): EList<EReference> {
    if (this._eAllReferencesCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eAllReferencesCache = (() => {
        return new BasicEList<EReference>(undefined, undefined, this.getEAllStructuralFeatures().filter(isEReference) as EReference[]);
      })();
      this._eAllReferencesCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eAllReferencesCache!;
  }
  getEReferences(): EList<EReference> {
    if (this._eReferencesCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eReferencesCache = (() => {
        return new BasicEList<EReference>(undefined, undefined, this.getEStructuralFeatures().filter(isEReference) as EReference[]);
      })();
      this._eReferencesCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eReferencesCache!;
  }
  getEAttributes(): EList<EAttribute> {
    if (this._eAttributesCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eAttributesCache = (() => {
        return new BasicEList<EAttribute>(undefined, undefined, this.getEStructuralFeatures().filter(isEAttribute) as EAttribute[]);
      })();
      this._eAttributesCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eAttributesCache!;
  }
  getEAllContainments(): EList<EReference> {
    if (this._eAllContainmentsCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eAllContainmentsCache = (() => {
        const references = this.getEAllStructuralFeatures().filter(isEReference) as EReference[];
        return new BasicEList<EReference>(undefined, undefined, references.filter(reference => reference.isContainment()));
      })();
      this._eAllContainmentsCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eAllContainmentsCache!;
  }
  getEAllOperations(): EList<EOperation> {
    if (this._eAllOperationsCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eAllOperationsCache = (() => {
        const operations = new Set<EOperation>();
        const visited = new Set<EClass>();
        const visit = (eClass: EClass): void => {
          if (visited.has(eClass)) return;
          visited.add(eClass);
          eClass.getESuperTypes().forEach(visit);
          for (const generic of eClass.getEGenericSuperTypes()) {
            const raw = generic.getEClassifier();
            if (raw !== undefined && isEClass(raw)) visit(raw);
          }
          eClass.getEOperations().forEach(operation => operations.add(operation));
        };
        visit(this);
        return new BasicEList<EOperation>(undefined, undefined, operations);
      })();
      this._eAllOperationsCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eAllOperationsCache!;
  }
  getEAllStructuralFeatures(): EList<EStructuralFeature> {
    if (this._eAllStructuralFeaturesCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eAllStructuralFeaturesCache = (() => {
        const features = new Set<EStructuralFeature>();
        const visited = new Set<EClass>();
        const visit = (eClass: EClass): void => {
          if (visited.has(eClass)) return;
          visited.add(eClass);
          eClass.getESuperTypes().forEach(visit);
          for (const generic of eClass.getEGenericSuperTypes()) {
            const raw = generic.getEClassifier();
            if (raw !== undefined && isEClass(raw)) visit(raw);
          }
          eClass.getEStructuralFeatures().forEach(feature => features.add(feature));
        };
        visit(this);
        return new BasicEList<EStructuralFeature>(undefined, undefined, features);
      })();
      this._eAllStructuralFeaturesCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eAllStructuralFeaturesCache!;
  }
  getEAllSuperTypes(): EList<EClass> {
    if (this._eAllSuperTypesCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eAllSuperTypesCache = (() => {
        const superTypes = new Set<EClass>();
        const visited = new Set<EClass>();
        const visit = (eClass: EClass): void => {
          if (visited.has(eClass)) return;
          visited.add(eClass);
          for (const sup of eClass.getESuperTypes()) {
            visit(sup);
            superTypes.add(sup);
          }
          for (const generic of eClass.getEGenericSuperTypes()) {
            const raw = generic.getEClassifier();
            if (raw !== undefined && isEClass(raw)) {
              visit(raw);
              superTypes.add(raw);
            }
          }
        };
        visit(this);
        return new BasicEList<EClass>(undefined, undefined, superTypes);
      })();
      this._eAllSuperTypesCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eAllSuperTypesCache!;
  }

  getEIDAttribute(): EAttribute | undefined {
    if (this._eIDAttributeCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eIDAttributeCache = (() => {
        return this.getEAllAttributes().find(a => a.isID());
      })();
      this._eIDAttributeCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eIDAttributeCache!;
  }
  getEStructuralFeatures(): EList<EStructuralFeature> {
    return this._eStructuralFeatures;
  }
  getEGenericSuperTypes(): EList<EGenericType> {
    return this._eGenericSuperTypes;
  }
  getEAllGenericSuperTypes(): EList<EGenericType> {
    if (this._eAllGenericSuperTypesCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eAllGenericSuperTypesCache = (() => {
        const genericSuperTypes = new Set<EGenericType>();
        const visited = new Set<EClass>();
        const visit = (eClass: EClass): void => {
          if (visited.has(eClass)) return;
          visited.add(eClass);
          for (const sup of eClass.getESuperTypes()) {
            visit(sup);
            const implicit = new EGenericTypeImpl();
            implicit.setEClassifier(sup);
            genericSuperTypes.add(implicit);
          }
          for (const generic of eClass.getEGenericSuperTypes()) {
            const raw = generic.getEClassifier();
            if (raw !== undefined && isEClass(raw)) {
              visit(raw);
              genericSuperTypes.add(generic);
            }
          }
        };
        visit(this);
        return new BasicEList<EGenericType>(undefined, undefined, genericSuperTypes);
      })();
      this._eAllGenericSuperTypesCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eAllGenericSuperTypesCache!;
  }
  isSuperTypeOf(someClass: EClass): boolean {
    const visited = new Set<EClass>();
    const pending: EClass[] = [someClass];
    while (pending.length > 0) {
      const current = pending.pop()!;
      if (current === this) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      pending.push(...current.getESuperTypes());
      for (const generic of current.getEGenericSuperTypes()) {
        const raw = generic.getEClassifier();
        if (raw !== undefined && isEClass(raw)) pending.push(raw);
      }
    }
    return false;
  }
  getFeatureCount(): number {
    return this.getEAllStructuralFeatures().size();
  }

  getEStructuralFeature(featureID: number): EStructuralFeature | undefined;
  getEStructuralFeature(featureName: string): EStructuralFeature | undefined;
  getEStructuralFeature(featureIDOrFeatureName: number | string): EStructuralFeature | undefined {
    if (typeof featureIDOrFeatureName === 'number') {
      return this.getEAllStructuralFeatures().filter(feature => this.getFeatureID(feature) === featureIDOrFeatureName).at(0);
    }
    if (typeof featureIDOrFeatureName === 'string') {
      return this.getEAllStructuralFeatures().filter(feature => feature.getName() === featureIDOrFeatureName).at(0);
    }
    throw new Error('EClass.getEStructuralFeature(): no overload matches the given arguments.');
  }
  getFeatureID(feature: EStructuralFeature): number {
    return (feature as EStructuralFeatureImpl).getFeatureID();
  }
  getOperationCount(): number {
    return this.getEAllOperations().size();
  }
  getEOperation(operationID: number): EOperation | undefined {
    return this.getEAllOperations().filter(op => this.getOperationID(op) === operationID).at(0);
  }
  getOperationID(operation: EOperation): number {
    return (operation as EOperationImpl).getOperationID();
  }
  getOverride(operation: EOperation): EOperation | undefined {
    if (operation.getEContainingClass() === this) return undefined;
    for (const candidate of this.getEAllOperations()) {
      if (candidate.isOverrideOf(operation)) return candidate;
    }
    return undefined;
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 8: return this._abstract;
      case 9: return this._interface;
      case 10: return this._eSuperTypes;
      case 11: return this._eOperations;

      case 12: return this.getEAllAttributes();

      case 13: return this.getEAllReferences();

      case 14: return this.getEReferences();

      case 15: return this.getEAttributes();

      case 16: return this.getEAllContainments();

      case 17: return this.getEAllOperations();

      case 18: return this.getEAllStructuralFeatures();

      case 19: return this.getEAllSuperTypes();

      case 20: return this.getEIDAttribute();
      case 21: return this._eStructuralFeatures;
      case 22: return this._eGenericSuperTypes;

      case 23: return this.getEAllGenericSuperTypes();
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 8: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 9: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 10: {
        const list = this._eSuperTypes;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EClass);
        return;
      }

      case 11: {
        const list = this._eOperations;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EOperation);
        return;
      }









      case 21: {
        const list = this._eStructuralFeatures;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EStructuralFeature);
        return;
      }

      case 22: {
        const list = this._eGenericSuperTypes;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EGenericType);
        return;
      }


      default:
        super.eSet(feature, value);
        return;
    }
  }
  eBasicSetValue(feature: EStructuralFeature | number, value: unknown): void {
    const featureId = typeof feature === 'number' ? feature : feature.getFeatureID();
    switch (featureId) {
      case 8: this._abstract = value as boolean; return;
      case 9: this._interface = value as boolean; return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 10:
        if (!this._eSuperTypesCache) this._eSuperTypesCache = new BasicEList<EClass>(this);
        return this._eSuperTypesCache;
      case 11:
        if (!this._eOperationsCache) this._eOperationsCache = new BasicEList<EOperation>(this);
        return this._eOperationsCache;
      case 21:
        if (!this._eStructuralFeaturesCache) this._eStructuralFeaturesCache = new BasicEList<EStructuralFeature>(this);
        return this._eStructuralFeaturesCache;
      case 22:
        if (!this._eGenericSuperTypesCache) this._eGenericSuperTypesCache = new BasicEList<EGenericType>(this);
        return this._eGenericSuperTypesCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 8: return this._abstract !== false;
      case 9: return this._interface !== false;
      case 10: return this._eSuperTypesCache !== undefined && this._eSuperTypesCache.size() !== 0;
      case 11: return this._eOperationsCache !== undefined && this._eOperationsCache.size() !== 0;

      case 12: return this.getEAllAttributes().size() !== 0;

      case 13: return this.getEAllReferences().size() !== 0;

      case 14: return this.getEReferences().size() !== 0;

      case 15: return this.getEAttributes().size() !== 0;

      case 16: return this.getEAllContainments().size() !== 0;

      case 17: return this.getEAllOperations().size() !== 0;

      case 18: return this.getEAllStructuralFeatures().size() !== 0;

      case 19: return this.getEAllSuperTypes().size() !== 0;

      case 20: return this.getEIDAttribute() !== undefined;
      case 21: return this._eStructuralFeaturesCache !== undefined && this._eStructuralFeaturesCache.size() !== 0;
      case 22: return this._eGenericSuperTypesCache !== undefined && this._eGenericSuperTypesCache.size() !== 0;

      case 23: return this.getEAllGenericSuperTypes().size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {

      case 8: {
        const oldValue = this._abstract;
        this._abstract = false;
        this.eDidRemove(feature, oldValue);
        return;
      }


      case 9: {
        const oldValue = this._interface;
        this._interface = false;
        this.eDidRemove(feature, oldValue);
        return;
      }

      case 10: this._eSuperTypesCache?.clear(); return;

      case 11: this._eOperationsCache?.clear(); return;










      case 21: this._eStructuralFeaturesCache?.clear(); return;

      case 22: this._eGenericSuperTypesCache?.clear(); return;


      default:
        super.eUnset(feature);
        return;
    }
  }
}
