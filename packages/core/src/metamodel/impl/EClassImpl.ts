import { EList } from '../types/EList.js';
import { EObjectImpl } from './EObjectImpl.js';
import { BasicEList } from './BasicEList.js';
import { EClass } from '../types/EClass.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EOperation } from '../types/EOperation.js';
import { EAttribute } from '../types/EAttribute.js';
import { EReference } from '../types/EReference.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { EGenericType } from '../types/EGenericType.js';
import { EClassifierImpl } from './EClassifierImpl.js';


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

  private _eAllAttributesCache: BasicEList<EAttribute> | undefined;

  private get _eAllAttributes(): BasicEList<EAttribute> {
    if (!this._eAllAttributesCache) {
      this._eAllAttributesCache = new BasicEList<EAttribute>(this, getEcorePackageRef().getEClass_EAllAttributes());
    }
    return this._eAllAttributesCache;
  }

  private _eAllReferencesCache: BasicEList<EReference> | undefined;

  private get _eAllReferences(): BasicEList<EReference> {
    if (!this._eAllReferencesCache) {
      this._eAllReferencesCache = new BasicEList<EReference>(this, getEcorePackageRef().getEClass_EAllReferences());
    }
    return this._eAllReferencesCache;
  }

  private _eReferencesCache: BasicEList<EReference> | undefined;

  private get _eReferences(): BasicEList<EReference> {
    if (!this._eReferencesCache) {
      this._eReferencesCache = new BasicEList<EReference>(this, getEcorePackageRef().getEClass_EReferences());
    }
    return this._eReferencesCache;
  }

  private _eAttributesCache: BasicEList<EAttribute> | undefined;

  private get _eAttributes(): BasicEList<EAttribute> {
    if (!this._eAttributesCache) {
      this._eAttributesCache = new BasicEList<EAttribute>(this, getEcorePackageRef().getEClass_EAttributes());
    }
    return this._eAttributesCache;
  }

  private _eAllContainmentsCache: BasicEList<EReference> | undefined;

  private get _eAllContainments(): BasicEList<EReference> {
    if (!this._eAllContainmentsCache) {
      this._eAllContainmentsCache = new BasicEList<EReference>(this, getEcorePackageRef().getEClass_EAllContainments());
    }
    return this._eAllContainmentsCache;
  }

  private _eAllOperationsCache: BasicEList<EOperation> | undefined;

  private get _eAllOperations(): BasicEList<EOperation> {
    if (!this._eAllOperationsCache) {
      this._eAllOperationsCache = new BasicEList<EOperation>(this, getEcorePackageRef().getEClass_EAllOperations());
    }
    return this._eAllOperationsCache;
  }

  private _eAllStructuralFeaturesCache: BasicEList<EStructuralFeature> | undefined;

  private get _eAllStructuralFeatures(): BasicEList<EStructuralFeature> {
    if (!this._eAllStructuralFeaturesCache) {
      this._eAllStructuralFeaturesCache = new BasicEList<EStructuralFeature>(this, getEcorePackageRef().getEClass_EAllStructuralFeatures());
    }
    return this._eAllStructuralFeaturesCache;
  }

  private _eAllSuperTypesCache: BasicEList<EClass> | undefined;

  private get _eAllSuperTypes(): BasicEList<EClass> {
    if (!this._eAllSuperTypesCache) {
      this._eAllSuperTypesCache = new BasicEList<EClass>(this, getEcorePackageRef().getEClass_EAllSuperTypes());
    }
    return this._eAllSuperTypesCache;
  }
  private _eIDAttribute: EAttribute | undefined;

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

  private _eAllGenericSuperTypesCache: BasicEList<EGenericType> | undefined;

  private get _eAllGenericSuperTypes(): BasicEList<EGenericType> {
    if (!this._eAllGenericSuperTypesCache) {
      this._eAllGenericSuperTypesCache = new BasicEList<EGenericType>(this, getEcorePackageRef().getEClass_EAllGenericSuperTypes());
    }
    return this._eAllGenericSuperTypesCache;
  }


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
    return this._eAllAttributes;
  }
  getEAllReferences(): EList<EReference> {
    return this._eAllReferences;
  }
  getEReferences(): EList<EReference> {
    return this._eReferences;
  }
  getEAttributes(): EList<EAttribute> {
    return this._eAttributes;
  }
  getEAllContainments(): EList<EReference> {
    return this._eAllContainments;
  }
  getEAllOperations(): EList<EOperation> {
    return this._eAllOperations;
  }
  getEAllStructuralFeatures(): EList<EStructuralFeature> {
    return this._eAllStructuralFeatures;
  }
  getEAllSuperTypes(): EList<EClass> {
    return this._eAllSuperTypes;
  }
  getEIDAttribute(): EAttribute | undefined {
    return this._eIDAttribute;
  }

  setEIDAttribute(value: EAttribute | undefined): void {
    this.eSet(getEcorePackageRef().getEClass_EIDAttribute(), value);
  }
  getEStructuralFeatures(): EList<EStructuralFeature> {
    return this._eStructuralFeatures;
  }
  getEGenericSuperTypes(): EList<EGenericType> {
    return this._eGenericSuperTypes;
  }
  getEAllGenericSuperTypes(): EList<EGenericType> {
    return this._eAllGenericSuperTypes;
  }

  isSuperTypeOf(someClass: EClass): boolean {
    throw new Error('EClass.isSuperTypeOf() has no body:typescript annotation - nothing to generate.');
  }

  getFeatureCount(): number {
    throw new Error('EClass.getFeatureCount() has no body:typescript annotation - nothing to generate.');
  }

  getEStructuralFeature(featureID: number): EStructuralFeature | undefined;
  getEStructuralFeature(featureName: string): EStructuralFeature | undefined;
  getEStructuralFeature(featureIDOrFeatureName: number | string): EStructuralFeature | undefined {
    throw new Error('EClass.getEStructuralFeature() is overloaded with no body:typescript annotation - nothing to generate.');
  }

  getFeatureID(feature: EStructuralFeature): number {
    throw new Error('EClass.getFeatureID() has no body:typescript annotation - nothing to generate.');
  }

  getOperationCount(): number {
    throw new Error('EClass.getOperationCount() has no body:typescript annotation - nothing to generate.');
  }

  getEOperation(operationID: number): EOperation | undefined {
    throw new Error('EClass.getEOperation() has no body:typescript annotation - nothing to generate.');
  }

  getOperationID(operation: EOperation): number {
    throw new Error('EClass.getOperationID() has no body:typescript annotation - nothing to generate.');
  }

  getOverride(operation: EOperation): EOperation | undefined {
    throw new Error('EClass.getOverride() has no body:typescript annotation - nothing to generate.');
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 8: return this._abstract;
      case 9: return this._interface;
      case 10: return this._eSuperTypes;
      case 11: return this._eOperations;
      case 12: return this._eAllAttributes;
      case 13: return this._eAllReferences;
      case 14: return this._eReferences;
      case 15: return this._eAttributes;
      case 16: return this._eAllContainments;
      case 17: return this._eAllOperations;
      case 18: return this._eAllStructuralFeatures;
      case 19: return this._eAllSuperTypes;
      case 20: return this._eIDAttribute;
      case 21: return this._eStructuralFeatures;
      case 22: return this._eGenericSuperTypes;
      case 23: return this._eAllGenericSuperTypes;
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
      case 12: {
        const list = this._eAllAttributes;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EAttribute);
        return;
      }
      case 13: {
        const list = this._eAllReferences;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EReference);
        return;
      }
      case 14: {
        const list = this._eReferences;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EReference);
        return;
      }
      case 15: {
        const list = this._eAttributes;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EAttribute);
        return;
      }
      case 16: {
        const list = this._eAllContainments;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EReference);
        return;
      }
      case 17: {
        const list = this._eAllOperations;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EOperation);
        return;
      }
      case 18: {
        const list = this._eAllStructuralFeatures;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EStructuralFeature);
        return;
      }
      case 19: {
        const list = this._eAllSuperTypes;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EClass);
        return;
      }
      case 20: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
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
      case 23: {
        const list = this._eAllGenericSuperTypes;
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
      case 20: this._eIDAttribute = value as EAttribute | undefined; return;
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
      case 12:
        if (!this._eAllAttributesCache) this._eAllAttributesCache = new BasicEList<EAttribute>(this);
        return this._eAllAttributesCache;
      case 13:
        if (!this._eAllReferencesCache) this._eAllReferencesCache = new BasicEList<EReference>(this);
        return this._eAllReferencesCache;
      case 14:
        if (!this._eReferencesCache) this._eReferencesCache = new BasicEList<EReference>(this);
        return this._eReferencesCache;
      case 15:
        if (!this._eAttributesCache) this._eAttributesCache = new BasicEList<EAttribute>(this);
        return this._eAttributesCache;
      case 16:
        if (!this._eAllContainmentsCache) this._eAllContainmentsCache = new BasicEList<EReference>(this);
        return this._eAllContainmentsCache;
      case 17:
        if (!this._eAllOperationsCache) this._eAllOperationsCache = new BasicEList<EOperation>(this);
        return this._eAllOperationsCache;
      case 18:
        if (!this._eAllStructuralFeaturesCache) this._eAllStructuralFeaturesCache = new BasicEList<EStructuralFeature>(this);
        return this._eAllStructuralFeaturesCache;
      case 19:
        if (!this._eAllSuperTypesCache) this._eAllSuperTypesCache = new BasicEList<EClass>(this);
        return this._eAllSuperTypesCache;
      case 21:
        if (!this._eStructuralFeaturesCache) this._eStructuralFeaturesCache = new BasicEList<EStructuralFeature>(this);
        return this._eStructuralFeaturesCache;
      case 22:
        if (!this._eGenericSuperTypesCache) this._eGenericSuperTypesCache = new BasicEList<EGenericType>(this);
        return this._eGenericSuperTypesCache;
      case 23:
        if (!this._eAllGenericSuperTypesCache) this._eAllGenericSuperTypesCache = new BasicEList<EGenericType>(this);
        return this._eAllGenericSuperTypesCache;
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
      case 12: return this._eAllAttributesCache !== undefined && this._eAllAttributesCache.size() !== 0;
      case 13: return this._eAllReferencesCache !== undefined && this._eAllReferencesCache.size() !== 0;
      case 14: return this._eReferencesCache !== undefined && this._eReferencesCache.size() !== 0;
      case 15: return this._eAttributesCache !== undefined && this._eAttributesCache.size() !== 0;
      case 16: return this._eAllContainmentsCache !== undefined && this._eAllContainmentsCache.size() !== 0;
      case 17: return this._eAllOperationsCache !== undefined && this._eAllOperationsCache.size() !== 0;
      case 18: return this._eAllStructuralFeaturesCache !== undefined && this._eAllStructuralFeaturesCache.size() !== 0;
      case 19: return this._eAllSuperTypesCache !== undefined && this._eAllSuperTypesCache.size() !== 0;
      case 20: return this._eIDAttribute !== undefined;
      case 21: return this._eStructuralFeaturesCache !== undefined && this._eStructuralFeaturesCache.size() !== 0;
      case 22: return this._eGenericSuperTypesCache !== undefined && this._eGenericSuperTypesCache.size() !== 0;
      case 23: return this._eAllGenericSuperTypesCache !== undefined && this._eAllGenericSuperTypesCache.size() !== 0;
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
      case 12: this._eAllAttributesCache?.clear(); return;
      case 13: this._eAllReferencesCache?.clear(); return;
      case 14: this._eReferencesCache?.clear(); return;
      case 15: this._eAttributesCache?.clear(); return;
      case 16: this._eAllContainmentsCache?.clear(); return;
      case 17: this._eAllOperationsCache?.clear(); return;
      case 18: this._eAllStructuralFeaturesCache?.clear(); return;
      case 19: this._eAllSuperTypesCache?.clear(); return;
      case 20: {
        const oldValue = this._eIDAttribute;
        this._eIDAttribute = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 21: this._eStructuralFeaturesCache?.clear(); return;
      case 22: this._eGenericSuperTypesCache?.clear(); return;
      case 23: this._eAllGenericSuperTypesCache?.clear(); return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
