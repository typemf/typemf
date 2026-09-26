import { EClass, EStructuralFeature } from '../types/index.js';
import { EObjectImpl, BasicEList } from './index.js';
import { EParameter } from '../types/EParameter.js';
import { EcorePackageImpl } from './EcorePackageImpl.js';
import { EOperation } from '../types/EOperation.js';
import { ETypedElementImpl } from './ETypedElementImpl.js';


export class EParameterImpl extends ETypedElementImpl implements EParameter {
  private _eOperation: EOperation | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEParameter();
  }

  getEOperation(): EOperation | undefined {
    return this._eOperation;
  }

  setEOperation(value: EOperation | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEParameter_EOperation(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 10: return this._eOperation;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 10: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      default:
        super.eSet(feature, value);
        return;
    }
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 10: this._eOperation = value as EOperation | undefined; return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 10: return this._eOperation !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 10: {
        const oldValue = this._eOperation;
        this._eOperation = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
