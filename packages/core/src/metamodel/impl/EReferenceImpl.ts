import { EClass, EList, EStructuralFeature } from '../types/index.js';
import { EObjectImpl, BasicEList } from './index.js';
import { EReference } from '../types/EReference.js';
import { EcorePackageImpl } from './EcorePackageImpl.js';
import { EAttribute } from '../types/EAttribute.js';
import { EStructuralFeatureImpl } from './EStructuralFeatureImpl.js';


export class EReferenceImpl extends EStructuralFeatureImpl implements EReference {
  private _containment: boolean = false;
  private _container: boolean = false;
  private _resolveProxies: boolean = false;
  private _eOpposite: EReference | undefined;
  private _eReferenceType: EClass | undefined;
  private readonly _eKeys = new BasicEList<EAttribute>(this, EcorePackageImpl.eINSTANCE.getEReference_EKeys());

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEReference();
  }

  isContainment(): boolean {
    return this._containment;
  }

  setContainment(value: boolean): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEReference_Containment(), value);
  }
  isContainer(): boolean {
    return (this.getEOpposite()?.isContainment() ?? false);
  }
  isResolveProxies(): boolean {
    return this._resolveProxies;
  }

  setResolveProxies(value: boolean): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEReference_ResolveProxies(), value);
  }
  getEOpposite(): EReference | undefined {
    return this._eOpposite;
  }

  setEOpposite(value: EReference | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEReference_EOpposite(), value);
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
      case 19: return this._container;
      case 20: return this._resolveProxies;
      case 21: return this._eOpposite;
      case 22: return this._eReferenceType;
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
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 19: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
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
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 22: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
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

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
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

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 18: return this._containment !== false;
      case 19: return this._container !== false;
      case 20: return this._resolveProxies !== false;
      case 21: return this._eOpposite !== undefined;
      case 22: return this._eReferenceType !== undefined;
      case 23: return this._eKeys.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 18: {
        const oldValue = this._containment;
        this._containment = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 19: {
        const oldValue = this._container;
        this._container = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 20: {
        const oldValue = this._resolveProxies;
        this._resolveProxies = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 21: {
        const oldValue = this._eOpposite;
        this._eOpposite = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 22: {
        const oldValue = this._eReferenceType;
        this._eReferenceType = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 23: this._eKeys.clear(); return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
