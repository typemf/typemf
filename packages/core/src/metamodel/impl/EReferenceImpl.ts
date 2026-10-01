import { BasicEList } from './BasicEList.js';
import { EStructuralFeatureImpl } from './EStructuralFeatureImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EAttribute } from '../types/EAttribute.js';
import { EClass } from '../types/EClass.js';
import { EList } from '../types/EList.js';
import { EReference } from '../types/EReference.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';



export class EReferenceImpl extends EStructuralFeatureImpl implements EReference {

  private _containment: boolean = false;

  private _container: boolean = false;

  private _resolveProxies: boolean = true;

  private _eOpposite: EReference | undefined;

  private _eReferenceType: EClass | undefined;

  private _eKeysCache: BasicEList<EAttribute> | undefined;

  private get _eKeys(): BasicEList<EAttribute> {
    if (!this._eKeysCache) {
      this._eKeysCache = new BasicEList<EAttribute>(this, getEcorePackageRef().getEReference_EKeys());
    }
    return this._eKeysCache;
  }


  eClass(): EClass {
    return getEcorePackageRef().getEReference();
  }

  isContainment(): boolean {
    return this._containment;
  }
  setContainment(value: boolean): void {
    this.eSet(getEcorePackageRef().getEReference_Containment(), value);
  }
  isContainer(): boolean {
    return (this.getEOpposite()?.isContainment() ?? false);
  }
  isResolveProxies(): boolean {
    return this._resolveProxies;
  }
  setResolveProxies(value: boolean): void {
    this.eSet(getEcorePackageRef().getEReference_ResolveProxies(), value);
  }
  getEOpposite(): EReference | undefined {
    return this._eOpposite;
  }
  setEOpposite(value: EReference | undefined): void {
    this.eSet(getEcorePackageRef().getEReference_EOpposite(), value);
  }
  getEReferenceType(): EClass | undefined {
    return (this.getEType() as EClass | undefined);
  }
  getEKeys(): EList<EAttribute> {
    return this._eKeys;
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 18: return this._containment;

      case 19: return this.isContainer();
      case 20: return this._resolveProxies;
      case 21: return this._eOpposite;

      case 22: return this.getEReferenceType();
      case 23: return this._eKeys;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 18: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({ eventType: 'SET', notifier: this, feature, oldValue, newValue: value, position: undefined, wasSet });
        return;
      }
      case 20: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({ eventType: 'SET', notifier: this, feature, oldValue, newValue: value, position: undefined, wasSet });
        return;
      }
      case 21: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({ eventType: 'SET', notifier: this, feature, oldValue, newValue: value, position: undefined, wasSet });
        return;
      }
      case 23: {
        const list = this._eKeys;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EAttribute);
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
      case 18: this._containment = value as boolean; return;
      case 19: this._container = value as boolean; return;
      case 20: this._resolveProxies = value as boolean; return;
      case 21: this._eOpposite = value as EReference | undefined; return;
      case 22: this._eReferenceType = value as EClass | undefined; return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 23:
        if (!this._eKeysCache) this._eKeysCache = new BasicEList<EAttribute>(this);
        return this._eKeysCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 18: return this._containment !== false;
      case 19: return this._container !== false;
      case 20: return this._resolveProxies !== true;
      case 21: return this._eOpposite !== undefined;
      case 22: return this._eReferenceType !== undefined;
      case 23: return this._eKeysCache !== undefined && this._eKeysCache.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {

      case 18: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._containment;
        this._containment = false;
        this.eDidRemove(feature, oldValue);
        this.eNotify({ eventType: 'UNSET', notifier: this, feature, oldValue, newValue: undefined, position: undefined, wasSet });
        return;
      }


      case 19: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._container;
        this._container = false;
        this.eDidRemove(feature, oldValue);
        this.eNotify({ eventType: 'UNSET', notifier: this, feature, oldValue, newValue: undefined, position: undefined, wasSet });
        return;
      }


      case 20: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._resolveProxies;
        this._resolveProxies = true;
        this.eDidRemove(feature, oldValue);
        this.eNotify({ eventType: 'UNSET', notifier: this, feature, oldValue, newValue: undefined, position: undefined, wasSet });
        return;
      }


      case 21: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eOpposite;
        this._eOpposite = undefined;
        this.eDidRemove(feature, oldValue);
        this.eNotify({ eventType: 'UNSET', notifier: this, feature, oldValue, newValue: undefined, position: undefined, wasSet });
        return;
      }


      case 22: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eReferenceType;
        this._eReferenceType = undefined;
        this.eDidRemove(feature, oldValue);
        this.eNotify({ eventType: 'UNSET', notifier: this, feature, oldValue, newValue: undefined, position: undefined, wasSet });
        return;
      }

      case 23: this._eKeysCache?.clear(); return;

      default:
        super.eUnset(feature);
        return;
    }
  }
}
