import { BasicEList } from './BasicEList.js';
import { ETypedElementImpl } from './ETypedElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EClassifier } from '../types/EClassifier.js';
import { EGenericType } from '../types/EGenericType.js';
import { EList } from '../types/EList.js';
import { EOperation } from '../types/EOperation.js';
import { EParameter } from '../types/EParameter.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { ETypeParameter } from '../types/ETypeParameter.js';



export class EOperationImpl extends ETypedElementImpl implements EOperation {

  private _eContainingClass: EClass | undefined;

  private _eTypeParametersCache: BasicEList<ETypeParameter> | undefined;

  private get _eTypeParameters(): BasicEList<ETypeParameter> {
    if (!this._eTypeParametersCache) {
      this._eTypeParametersCache = new BasicEList<ETypeParameter>(this, getEcorePackageRef().getEOperation_ETypeParameters());
    }
    return this._eTypeParametersCache;
  }

  private _eParametersCache: BasicEList<EParameter> | undefined;

  private get _eParameters(): BasicEList<EParameter> {
    if (!this._eParametersCache) {
      this._eParametersCache = new BasicEList<EParameter>(this, getEcorePackageRef().getEOperation_EParameters());
    }
    return this._eParametersCache;
  }

  private _eExceptionsCache: BasicEList<EClassifier> | undefined;

  private get _eExceptions(): BasicEList<EClassifier> {
    if (!this._eExceptionsCache) {
      this._eExceptionsCache = new BasicEList<EClassifier>(this, getEcorePackageRef().getEOperation_EExceptions());
    }
    return this._eExceptionsCache;
  }

  private _eGenericExceptionsCache: BasicEList<EGenericType> | undefined;

  private get _eGenericExceptions(): BasicEList<EGenericType> {
    if (!this._eGenericExceptionsCache) {
      this._eGenericExceptionsCache = new BasicEList<EGenericType>(this, getEcorePackageRef().getEOperation_EGenericExceptions());
    }
    return this._eGenericExceptionsCache;
  }


  private operationId = -1;

  getOperationID(): number {
    return this.operationId;
  }

  setOperationID(id: number): void {
    this.operationId = id;
  }

  eClass(): EClass {
    return getEcorePackageRef().getEOperation();
  }

  getEContainingClass(): EClass | undefined {
    return this._eContainingClass;
  }

  setEContainingClass(value: EClass | undefined): void {
    this._eContainingClass = value;
  }
  getETypeParameters(): EList<ETypeParameter> {
    return this._eTypeParameters;
  }
  getEParameters(): EList<EParameter> {
    return this._eParameters;
  }
  getEExceptions(): EList<EClassifier> {
    return this._eExceptions;
  }
  getEGenericExceptions(): EList<EGenericType> {
    return this._eGenericExceptions;
  }

  isOverrideOf(someOperation: EOperation): boolean {
    if (someOperation === this) return false;
    const thisClass = this.getEContainingClass();
    const otherClass = someOperation.getEContainingClass();
    if (thisClass === undefined || otherClass === undefined) return false;
    if (thisClass === otherClass) return false;
    if (!otherClass.isSuperTypeOf(thisClass)) return false;
    if (this.getName() !== someOperation.getName()) return false;
    const params = this.getEParameters();
    const otherParams = someOperation.getEParameters();
    if (params.size() !== otherParams.size()) return false;
    for (let i = 0; i < params.size(); i++) {
      if (params.get(i)!.getEType() !== otherParams.get(i)!.getEType()) return false;
    }
    return true;
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 10: return this._eContainingClass;
      case 11: return this._eTypeParameters;
      case 12: return this._eParameters;
      case 13: return this._eExceptions;
      case 14: return this._eGenericExceptions;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 11: {
        const list = this._eTypeParameters;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as ETypeParameter);
        return;
      }

      case 12: {
        const list = this._eParameters;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EParameter);
        return;
      }

      case 13: {
        const list = this._eExceptions;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EClassifier);
        return;
      }

      case 14: {
        const list = this._eGenericExceptions;
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
      case 10: this._eContainingClass = value as EClass | undefined; return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 11:
        if (!this._eTypeParametersCache) this._eTypeParametersCache = new BasicEList<ETypeParameter>(this);
        return this._eTypeParametersCache;
      case 12:
        if (!this._eParametersCache) this._eParametersCache = new BasicEList<EParameter>(this);
        return this._eParametersCache;
      case 13:
        if (!this._eExceptionsCache) this._eExceptionsCache = new BasicEList<EClassifier>(this);
        return this._eExceptionsCache;
      case 14:
        if (!this._eGenericExceptionsCache) this._eGenericExceptionsCache = new BasicEList<EGenericType>(this);
        return this._eGenericExceptionsCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 10: return this._eContainingClass !== undefined;
      case 11: return this._eTypeParametersCache !== undefined && this._eTypeParametersCache.size() !== 0;
      case 12: return this._eParametersCache !== undefined && this._eParametersCache.size() !== 0;
      case 13: return this._eExceptionsCache !== undefined && this._eExceptionsCache.size() !== 0;
      case 14: return this._eGenericExceptionsCache !== undefined && this._eGenericExceptionsCache.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {

      case 10: {
        const oldValue = this._eContainingClass;
        this._eContainingClass = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }

      case 11: this._eTypeParametersCache?.clear(); return;

      case 12: this._eParametersCache?.clear(); return;

      case 13: this._eExceptionsCache?.clear(); return;

      case 14: this._eGenericExceptionsCache?.clear(); return;

      default:
        super.eUnset(feature);
        return;
    }
  }
}
