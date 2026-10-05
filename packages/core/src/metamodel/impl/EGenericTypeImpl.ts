import { BasicEList } from './BasicEList.js';
import { EObjectImpl } from './EObjectImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EClassifier } from '../types/EClassifier.js';
import { EGenericType } from '../types/EGenericType.js';
import { EList } from '../types/EList.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { ETypeParameter } from '../types/ETypeParameter.js';

export class EGenericTypeImpl extends EObjectImpl implements EGenericType {
  private _eUpperBound: EGenericType | undefined;

  private _eTypeArgumentsCache: BasicEList<EGenericType> | undefined;

  private get _eTypeArguments(): BasicEList<EGenericType> {
    this._eTypeArgumentsCache ??= new BasicEList<EGenericType>(
      this,
      getEcorePackageRef().getEGenericType_ETypeArguments()
    );
    return this._eTypeArgumentsCache;
  }

  private _eRawTypeCache: EClassifier | undefined;
  private _eRawTypeCacheGeneration = -1;

  private _eLowerBound: EGenericType | undefined;

  private _eTypeParameter: ETypeParameter | undefined;

  private _eClassifier: EClassifier | undefined;

  eClass(): EClass {
    return getEcorePackageRef().getEGenericType();
  }

  getEUpperBound(): EGenericType | undefined {
    return this._eUpperBound;
  }
  setEUpperBound(value: EGenericType | undefined): void {
    this.eSet(getEcorePackageRef().getEGenericType_EUpperBound(), value);
  }
  getETypeArguments(): EList<EGenericType> {
    return this._eTypeArguments;
  }

  getERawType(): EClassifier | undefined {
    if (this._eRawTypeCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._eRawTypeCache = (() => {
        if (this.getEClassifier() !== undefined) return this.getEClassifier();
        const typeParameter = this.getETypeParameter();
        if (typeParameter !== undefined && !typeParameter.getEBounds().isEmpty()) {
          const bound = typeParameter.getEBounds().get(0);
          return bound.getERawType();
        }
        const upperBound = this.getEUpperBound();
        if (upperBound !== undefined) return upperBound.getERawType();
        return getEcorePackageRef().getEJavaObject();
      })();
      this._eRawTypeCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._eRawTypeCache!;
  }
  getELowerBound(): EGenericType | undefined {
    return this._eLowerBound;
  }
  setELowerBound(value: EGenericType | undefined): void {
    this.eSet(getEcorePackageRef().getEGenericType_ELowerBound(), value);
  }
  getETypeParameter(): ETypeParameter | undefined {
    return this._eTypeParameter;
  }
  setETypeParameter(value: ETypeParameter | undefined): void {
    this.eSet(getEcorePackageRef().getEGenericType_ETypeParameter(), value);
  }
  getEClassifier(): EClassifier | undefined {
    return this._eClassifier;
  }
  setEClassifier(value: EClassifier | undefined): void {
    this.eSet(getEcorePackageRef().getEGenericType_EClassifier(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 0:
        return this._eUpperBound;
      case 1:
        return this._eTypeArguments;

      case 2:
        return this.getERawType();
      case 3:
        return this._eLowerBound;
      case 4:
        return this._eTypeParameter;
      case 5:
        return this._eClassifier;
      default:
        throw new Error(`EGenericType has no feature with id ${String(feature.getFeatureID())}`);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 0: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      case 1: {
        const list = this._eTypeArguments;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EGenericType);
        return;
      }

      case 3: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      case 4: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      case 5: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      default:
        throw new Error(`EGenericType has no feature with id ${String(feature.getFeatureID())}`);
    }
  }
  eBasicSetValue(feature: EStructuralFeature | number, value: unknown): void {
    const featureId = typeof feature === 'number' ? feature : feature.getFeatureID();
    switch (featureId) {
      case 0:
        this._eUpperBound = value as EGenericType | undefined;
        return;
      case 3:
        this._eLowerBound = value as EGenericType | undefined;
        return;
      case 4:
        this._eTypeParameter = value as ETypeParameter | undefined;
        return;
      case 5:
        this._eClassifier = value as EClassifier | undefined;
        return;
      default:
        throw new Error(`Feature ${String(featureId)} on EGenericType is many-valued or unknown.`);
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 1:
        this._eTypeArgumentsCache ??= new BasicEList<EGenericType>(this);
        return this._eTypeArgumentsCache;
      default:
        throw new Error(`Feature ${String(featureId)} on EGenericType is single-valued or unknown.`);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 0:
        return this._eUpperBound !== undefined;
      case 1:
        return this._eTypeArgumentsCache !== undefined && this._eTypeArgumentsCache.size() !== 0;

      case 2:
        return this.getERawType() !== undefined;
      case 3:
        return this._eLowerBound !== undefined;
      case 4:
        return this._eTypeParameter !== undefined;
      case 5:
        return this._eClassifier !== undefined;
      default:
        throw new Error(`EGenericType has no feature with id ${String(feature.getFeatureID())}`);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 0: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eUpperBound;
        this._eUpperBound = undefined;
        this.eDidRemove(feature, oldValue);
        this.eNotify({
          eventType: 'UNSET',
          notifier: this,
          feature,
          oldValue,
          newValue: undefined,
          position: undefined,
          wasSet,
        });
        return;
      }

      case 1:
        this._eTypeArgumentsCache?.clear();
        return;

      case 3: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eLowerBound;
        this._eLowerBound = undefined;
        this.eDidRemove(feature, oldValue);
        this.eNotify({
          eventType: 'UNSET',
          notifier: this,
          feature,
          oldValue,
          newValue: undefined,
          position: undefined,
          wasSet,
        });
        return;
      }

      case 4: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eTypeParameter;
        this._eTypeParameter = undefined;
        this.eDidRemove(feature, oldValue);
        this.eNotify({
          eventType: 'UNSET',
          notifier: this,
          feature,
          oldValue,
          newValue: undefined,
          position: undefined,
          wasSet,
        });
        return;
      }

      case 5: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eClassifier;
        this._eClassifier = undefined;
        this.eDidRemove(feature, oldValue);
        this.eNotify({
          eventType: 'UNSET',
          notifier: this,
          feature,
          oldValue,
          newValue: undefined,
          position: undefined,
          wasSet,
        });
        return;
      }

      default:
        throw new Error(`EGenericType has no feature with id ${String(feature.getFeatureID())}`);
    }
  }
}
