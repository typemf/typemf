import { BasicEList } from './BasicEList.js';
import { EClassifierImpl } from './EClassifierImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EDataType } from '../types/EDataType.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';



export class EDataTypeImpl extends EClassifierImpl implements EDataType {

  private _serializable: boolean = true;


  eClass(): EClass {
    return getEcorePackageRef().getEDataType();
  }

  isSerializable(): boolean {
    return this._serializable;
  }
  setSerializable(value: boolean): void {
    this.eSet(getEcorePackageRef().getEDataType_Serializable(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 8: return this._serializable;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 8: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({ eventType: 'SET', notifier: this, feature, oldValue, newValue: value, position: undefined, wasSet });
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
      case 8: this._serializable = value as boolean; return;
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
    switch (feature.getFeatureID()) {
      case 8: return this._serializable !== true;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {

      case 8: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._serializable;
        this._serializable = true;
        this.eDidRemove(feature, oldValue);
        this.eNotify({ eventType: 'UNSET', notifier: this, feature, oldValue, newValue: undefined, position: undefined, wasSet });
        return;
      }

      default:
        super.eUnset(feature);
        return;
    }
  }
}
