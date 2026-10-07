import { BasicEList } from './BasicEList.js';
import { EStructuralFeatureImpl } from './EStructuralFeatureImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EAttribute } from '../types/EAttribute.js';
import { EClass } from '../types/EClass.js';
import { EDataType } from '../types/EDataType.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';

/** A feature whose values are data values, instances of an `EDataType`. */
export class EAttributeImpl extends EStructuralFeatureImpl implements EAttribute {
  private _iD: boolean = false;

  private _eAttributeType: EDataType | undefined;

  eClass(): EClass {
    return getEcorePackageRef().getEAttribute();
  }

  isID(): boolean {
    return this._iD;
  }
  setID(value: boolean): void {
    this.eSet(getEcorePackageRef().getEAttribute_ID(), value);
  }
  getEAttributeType(): EDataType | undefined {
    return this.getEType() as EDataType | undefined;
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 18:
        return this._iD;

      case 19:
        return this.getEAttributeType();
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 18: {
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
        super.eSet(feature, value);
        return;
    }
  }
  eBasicSetValue(feature: EStructuralFeature | number, value: unknown): void {
    const featureId = typeof feature === 'number' ? feature : feature.getFeatureID();
    switch (featureId) {
      case 18:
        this._iD = value as boolean;
        return;
      case 19:
        this._eAttributeType = value as EDataType | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 18:
        return this._iD !== false;
      case 19:
        return this._eAttributeType !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 18: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._iD;
        this._iD = false;
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

      case 19: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eAttributeType;
        this._eAttributeType = undefined;
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
        super.eUnset(feature);
        return;
    }
  }
}
