import { BasicEList } from './BasicEList.js';
import { EObjectImpl } from './EObjectImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EStringToStringMapEntry } from '../types/EStringToStringMapEntry.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';

export class EStringToStringMapEntryImpl extends EObjectImpl implements EStringToStringMapEntry {
  private _key: string | undefined;

  private _value: string | undefined;

  eClass(): EClass {
    return getEcorePackageRef().getEStringToStringMapEntry();
  }

  getKey(): string | undefined {
    return this._key;
  }
  setKey(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEStringToStringMapEntry_Key(), value);
  }
  getValue(): string | undefined {
    return this._value;
  }
  setValue(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEStringToStringMapEntry_Value(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 0:
        return this._key;
      case 1:
        return this._value;
      default:
        throw new Error(`EStringToStringMapEntry has no feature with id ${String(feature.getFeatureID())}`);
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
        throw new Error(`EStringToStringMapEntry has no feature with id ${String(feature.getFeatureID())}`);
    }
  }
  eBasicSetValue(feature: EStructuralFeature | number, value: unknown): void {
    const featureId = typeof feature === 'number' ? feature : feature.getFeatureID();
    switch (featureId) {
      case 0:
        this._key = value as string | undefined;
        return;
      case 1:
        this._value = value as string | undefined;
        return;
      default:
        throw new Error(`Feature ${String(featureId)} on EStringToStringMapEntry is many-valued or unknown.`);
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      default:
        throw new Error(`Feature ${String(featureId)} on EStringToStringMapEntry is single-valued or unknown.`);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 0:
        return this._key !== undefined;
      case 1:
        return this._value !== undefined;
      default:
        throw new Error(`EStringToStringMapEntry has no feature with id ${String(feature.getFeatureID())}`);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 0: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._key;
        this._key = undefined;
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

      case 1: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._value;
        this._value = undefined;
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
        throw new Error(`EStringToStringMapEntry has no feature with id ${String(feature.getFeatureID())}`);
    }
  }
}
