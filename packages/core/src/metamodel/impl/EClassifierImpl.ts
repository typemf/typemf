import { EClass } from '../types/EClass.js';
import { EList } from '../types/EList.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { BasicEList } from './BasicEList.js';
import { EClassifier } from '../types/EClassifier.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EPackage } from '../types/EPackage.js';
import { ETypeParameter } from '../types/ETypeParameter.js';
import { ENamedElementImpl } from './ENamedElementImpl.js';
import { TypeScriptClass } from '../types/TypeScriptClass.js';


export class EClassifierImpl extends ENamedElementImpl implements EClassifier {
  private _instanceClassName: string | undefined;
  private _instanceClass: TypeScriptClass<unknown> | undefined;
  private _defaultValue: unknown | undefined;
  private _instanceTypeName: string | undefined;
  private _ePackage: EPackage | undefined;

  private _eTypeParametersCache: BasicEList<ETypeParameter> | undefined;

  private get _eTypeParameters(): BasicEList<ETypeParameter> {
    if (!this._eTypeParametersCache) {
      this._eTypeParametersCache = new BasicEList<ETypeParameter>(this, getEcorePackageRef().getEClassifier_ETypeParameters());
    }
    return this._eTypeParametersCache;
  }


  private classifierId = -1;

  getClassifierID(): number {
    return this.classifierId;
  }

  setClassifierID(id: number): void {
    this.classifierId = id;
  }

  eClass(): EClass {
    return getEcorePackageRef().getEClassifier();
  }

  getInstanceClassName(): string | undefined {
    return this._instanceClassName;
  }

  setInstanceClassName(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEClassifier_InstanceClassName(), value);
  }
  getInstanceClass(): TypeScriptClass<unknown> | undefined {
    return this._instanceClass;
  }

  setInstanceClass(value: TypeScriptClass<unknown> | undefined): void {
    this.eSet(getEcorePackageRef().getEClassifier_InstanceClass(), value);
  }
  getDefaultValue(): unknown | undefined {
    return this._defaultValue;
  }

  setDefaultValue(value: unknown | undefined): void {
    this.eSet(getEcorePackageRef().getEClassifier_DefaultValue(), value);
  }
  getInstanceTypeName(): string | undefined {
    return this._instanceTypeName;
  }

  setInstanceTypeName(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEClassifier_InstanceTypeName(), value);
  }
  getEPackage(): EPackage | undefined {
    return this._ePackage;
  }

  setEPackage(value: EPackage | undefined): void {
    this.eSet(getEcorePackageRef().getEClassifier_EPackage(), value);
  }
  getETypeParameters(): EList<ETypeParameter> {
    return this._eTypeParameters;
  }

  isInstance(object: unknown): boolean {
    throw new Error('EClassifier.isInstance() has no body:typescript annotation - nothing to generate.');
  }


  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 2: return this._instanceClassName;
      case 3: return this._instanceClass;
      case 4: return this._defaultValue;
      case 5: return this._instanceTypeName;
      case 6: return this._ePackage;
      case 7: return this._eTypeParameters;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
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
      case 6: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 7: {
        const list = this._eTypeParameters;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as ETypeParameter);
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
      case 2: this._instanceClassName = value as string | undefined; return;
      case 3: this._instanceClass = value as TypeScriptClass<unknown> | undefined; return;
      case 4: this._defaultValue = value as unknown | undefined; return;
      case 5: this._instanceTypeName = value as string | undefined; return;
      case 6: this._ePackage = value as EPackage | undefined; return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 7:
        if (!this._eTypeParametersCache) this._eTypeParametersCache = new BasicEList<ETypeParameter>(this);
        return this._eTypeParametersCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 2: return this._instanceClassName !== undefined;
      case 3: return this._instanceClass !== undefined;
      case 4: return this._defaultValue !== undefined;
      case 5: return this._instanceTypeName !== undefined;
      case 6: return this._ePackage !== undefined;
      case 7: return this._eTypeParametersCache !== undefined && this._eTypeParametersCache.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 2: {
        const oldValue = this._instanceClassName;
        this._instanceClassName = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 3: {
        const oldValue = this._instanceClass;
        this._instanceClass = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 4: {
        const oldValue = this._defaultValue;
        this._defaultValue = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 5: {
        const oldValue = this._instanceTypeName;
        this._instanceTypeName = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 6: {
        const oldValue = this._ePackage;
        this._ePackage = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 7: this._eTypeParametersCache?.clear(); return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
