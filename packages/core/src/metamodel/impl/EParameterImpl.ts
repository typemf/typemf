import { BasicEList } from './BasicEList.js';
import { ETypedElementImpl } from './ETypedElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EOperation } from '../types/EOperation.js';
import { EParameter } from '../types/EParameter.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';

/** A parameter of an operation. */
export class EParameterImpl extends ETypedElementImpl implements EParameter {
  private _eOperation: EOperation | undefined;

  eClass(): EClass {
    return getEcorePackageRef().getEParameter();
  }

  getEOperation(): EOperation | undefined {
    return this._eOperation;
  }

  setEOperation(value: EOperation | undefined): void {
    this._eOperation = value;
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 10:
        return this._eOperation;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      default:
        super.eSet(feature, value);
        return;
    }
  }
  eBasicSetValue(feature: EStructuralFeature | number, value: unknown): void {
    const featureId = typeof feature === 'number' ? feature : feature.getFeatureID();
    switch (featureId) {
      case 10:
        this._eOperation = value as EOperation | undefined;
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
      case 10:
        return this._eOperation !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 10: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eOperation;
        this._eOperation = undefined;
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
