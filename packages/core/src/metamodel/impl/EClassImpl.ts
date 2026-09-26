import { EList, EObject } from '../types/index.js';
import { EObjectImpl, BasicEList } from './index.js';
import { EClass } from '../types/EClass.js';
import { EcorePackageImpl } from './EcorePackageImpl.js';
import { EOperation } from '../types/EOperation.js';
import { EAttribute } from '../types/EAttribute.js';
import { EReference } from '../types/EReference.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { EGenericType } from '../types/EGenericType.js';
import { EClassifierImpl } from './EClassifierImpl.js';


export class EClassImpl extends EClassifierImpl implements EClass {
  private _abstract: boolean = false;
  private _interface: boolean = false;
  private readonly _eSuperTypes = new BasicEList<EClass>(this, EcorePackageImpl.eINSTANCE.getEClass_ESuperTypes());
  private readonly _eOperations = new BasicEList<EOperation>(this, EcorePackageImpl.eINSTANCE.getEClass_EOperations());
  private readonly _eAllAttributes = new BasicEList<EAttribute>(this, EcorePackageImpl.eINSTANCE.getEClass_EAllAttributes());
  private readonly _eAllReferences = new BasicEList<EReference>(this, EcorePackageImpl.eINSTANCE.getEClass_EAllReferences());
  private readonly _eReferences = new BasicEList<EReference>(this, EcorePackageImpl.eINSTANCE.getEClass_EReferences());
  private readonly _eAttributes = new BasicEList<EAttribute>(this, EcorePackageImpl.eINSTANCE.getEClass_EAttributes());
  private readonly _eAllContainments = new BasicEList<EReference>(this, EcorePackageImpl.eINSTANCE.getEClass_EAllContainments());
  private readonly _eAllOperations = new BasicEList<EOperation>(this, EcorePackageImpl.eINSTANCE.getEClass_EAllOperations());
  private readonly _eAllStructuralFeatures = new BasicEList<EStructuralFeature>(this, EcorePackageImpl.eINSTANCE.getEClass_EAllStructuralFeatures());
  private readonly _eAllSuperTypes = new BasicEList<EClass>(this, EcorePackageImpl.eINSTANCE.getEClass_EAllSuperTypes());
  private _eIDAttribute: EAttribute | undefined;
  private readonly _eStructuralFeatures = new BasicEList<EStructuralFeature>(this, EcorePackageImpl.eINSTANCE.getEClass_EStructuralFeatures());
  private readonly _eGenericSuperTypes = new BasicEList<EGenericType>(this, EcorePackageImpl.eINSTANCE.getEClass_EGenericSuperTypes());
  private readonly _eAllGenericSuperTypes = new BasicEList<EGenericType>(this, EcorePackageImpl.eINSTANCE.getEClass_EAllGenericSuperTypes());

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEClass();
  }

  isAbstract(): boolean {
    return this._abstract;
  }

  setAbstract(value: boolean): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEClass_Abstract(), value);
  }
  isInterface(): boolean {
    return this._interface;
  }

  setInterface(value: boolean): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEClass_Interface(), value);
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
    this.eSet(EcorePackageImpl.eINSTANCE.getEClass_EIDAttribute(), value);
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

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 8: this._abstract = value as boolean; return;
      case 9: this._interface = value as boolean; return;
      case 20: this._eIDAttribute = value as EAttribute | undefined; return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 8: return this._abstract !== false;
      case 9: return this._interface !== false;
      case 10: return this._eSuperTypes.size() !== 0;
      case 11: return this._eOperations.size() !== 0;
      case 12: return this._eAllAttributes.size() !== 0;
      case 13: return this._eAllReferences.size() !== 0;
      case 14: return this._eReferences.size() !== 0;
      case 15: return this._eAttributes.size() !== 0;
      case 16: return this._eAllContainments.size() !== 0;
      case 17: return this._eAllOperations.size() !== 0;
      case 18: return this._eAllStructuralFeatures.size() !== 0;
      case 19: return this._eAllSuperTypes.size() !== 0;
      case 20: return this._eIDAttribute !== undefined;
      case 21: return this._eStructuralFeatures.size() !== 0;
      case 22: return this._eGenericSuperTypes.size() !== 0;
      case 23: return this._eAllGenericSuperTypes.size() !== 0;
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
      case 10: this._eSuperTypes.clear(); return;
      case 11: this._eOperations.clear(); return;
      case 12: this._eAllAttributes.clear(); return;
      case 13: this._eAllReferences.clear(); return;
      case 14: this._eReferences.clear(); return;
      case 15: this._eAttributes.clear(); return;
      case 16: this._eAllContainments.clear(); return;
      case 17: this._eAllOperations.clear(); return;
      case 18: this._eAllStructuralFeatures.clear(); return;
      case 19: this._eAllSuperTypes.clear(); return;
      case 20: {
        const oldValue = this._eIDAttribute;
        this._eIDAttribute = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 21: this._eStructuralFeatures.clear(); return;
      case 22: this._eGenericSuperTypes.clear(); return;
      case 23: this._eAllGenericSuperTypes.clear(); return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
