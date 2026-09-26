import { EClass, EList, EStructuralFeature } from '../types/index.js';
import { EObjectImpl, BasicEList } from './index.js';
import { EGenericType } from '../types/EGenericType.js';
import { EcorePackageImpl } from './EcorePackageImpl.js';
import { EClassifier } from '../types/EClassifier.js';
import { ETypeParameter } from '../types/ETypeParameter.js';


export class EGenericTypeImpl extends EObjectImpl implements EGenericType {
  private _eUpperBound: EGenericType | undefined;
  private readonly _eTypeArguments = new BasicEList<EGenericType>(this, EcorePackageImpl.eINSTANCE.getEGenericType_ETypeArguments());
  private _eRawType: EClassifier | undefined;
  private _eLowerBound: EGenericType | undefined;
  private _eTypeParameter: ETypeParameter | undefined;
  private _eClassifier: EClassifier | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEGenericType();
  }

  getEUpperBound(): EGenericType | undefined {
    return this._eUpperBound;
  }

  setEUpperBound(value: EGenericType | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEGenericType_EUpperBound(), value);
  }
  getETypeArguments(): EList<EGenericType> {
    return this._eTypeArguments;
  }
  getERawType(): EClassifier | undefined {
    return this._eRawType;
  }

  setERawType(value: EClassifier | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEGenericType_ERawType(), value);
  }
  getELowerBound(): EGenericType | undefined {
    return this._eLowerBound;
  }

  setELowerBound(value: EGenericType | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEGenericType_ELowerBound(), value);
  }
  getETypeParameter(): ETypeParameter | undefined {
    return this._eTypeParameter;
  }

  setETypeParameter(value: ETypeParameter | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEGenericType_ETypeParameter(), value);
  }
  getEClassifier(): EClassifier | undefined {
    return this._eClassifier;
  }

  setEClassifier(value: EClassifier | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEGenericType_EClassifier(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 0: return this._eUpperBound;
      case 1: return this._eTypeArguments;
      case 2: return this._eRawType;
      case 3: return this._eLowerBound;
      case 4: return this._eTypeParameter;
      case 5: return this._eClassifier;
      default:
        throw new Error(`EGenericType has no feature with id ${feature.getFeatureID()}`);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 0: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 1: {
        const list = this._eTypeArguments;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EGenericType);
        return;
      }
      case 2: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 3: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 4: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 5: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      default:
        throw new Error(`EGenericType has no feature with id ${feature.getFeatureID()}`);
    }
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 0: this._eUpperBound = value as EGenericType | undefined; return;
      case 2: this._eRawType = value as EClassifier | undefined; return;
      case 3: this._eLowerBound = value as EGenericType | undefined; return;
      case 4: this._eTypeParameter = value as ETypeParameter | undefined; return;
      case 5: this._eClassifier = value as EClassifier | undefined; return;
      default:
        throw new Error(`Feature ${feature.getFeatureID()} on EGenericType is many-valued or unknown.`);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 0: return this._eUpperBound !== undefined;
      case 1: return this._eTypeArguments.size() !== 0;
      case 2: return this._eRawType !== undefined;
      case 3: return this._eLowerBound !== undefined;
      case 4: return this._eTypeParameter !== undefined;
      case 5: return this._eClassifier !== undefined;
      default:
        throw new Error(`EGenericType has no feature with id ${feature.getFeatureID()}`);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 0: {
        const oldValue = this._eUpperBound;
        this._eUpperBound = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 1: this._eTypeArguments.clear(); return;
      case 2: {
        const oldValue = this._eRawType;
        this._eRawType = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 3: {
        const oldValue = this._eLowerBound;
        this._eLowerBound = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 4: {
        const oldValue = this._eTypeParameter;
        this._eTypeParameter = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 5: {
        const oldValue = this._eClassifier;
        this._eClassifier = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        throw new Error(`EGenericType has no feature with id ${feature.getFeatureID()}`);
    }
  }
}
