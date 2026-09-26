import { EClass, EStructuralFeature } from '../types/index.js';
import { EObjectImpl, BasicEList } from './index.js';
import { EStringToStringMapEntry } from '../types/EStringToStringMapEntry.js';
import { EcorePackageImpl } from './EcorePackageImpl.js';


export class EStringToStringMapEntryImpl extends EObjectImpl implements EStringToStringMapEntry {
  private _key: string | undefined;
  private _value: string | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEStringToStringMapEntry();
  }

  getKey(): string | undefined {
    return this._key;
  }

  setKey(value: string | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEStringToStringMapEntry_Key(), value);
  }
  getValue(): string | undefined {
    return this._value;
  }

  setValue(value: string | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEStringToStringMapEntry_Value(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 0: return this._key;
      case 1: return this._value;
      default:
        throw new Error(`EStringToStringMapEntry has no feature with id ${feature.getFeatureID()}`);
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
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      default:
        throw new Error(`EStringToStringMapEntry has no feature with id ${feature.getFeatureID()}`);
    }
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 0: this._key = value as string | undefined; return;
      case 1: this._value = value as string | undefined; return;
      default:
        throw new Error(`Feature ${feature.getFeatureID()} on EStringToStringMapEntry is many-valued or unknown.`);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 0: return this._key !== undefined;
      case 1: return this._value !== undefined;
      default:
        throw new Error(`EStringToStringMapEntry has no feature with id ${feature.getFeatureID()}`);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 0: {
        const oldValue = this._key;
        this._key = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 1: {
        const oldValue = this._value;
        this._value = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        throw new Error(`EStringToStringMapEntry has no feature with id ${feature.getFeatureID()}`);
    }
  }
}
