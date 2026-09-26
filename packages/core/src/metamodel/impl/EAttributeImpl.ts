import { EClass, EStructuralFeature } from '../types/index.js';
import { EObjectImpl, BasicEList } from './index.js';
import { EAttribute } from '../types/EAttribute.js';
import { EcorePackageImpl } from './EcorePackageImpl.js';
import { EDataType } from '../types/EDataType.js';
import { EStructuralFeatureImpl } from './EStructuralFeatureImpl.js';


export class EAttributeImpl extends EStructuralFeatureImpl implements EAttribute {
  private _iD: boolean = false;
  private _eAttributeType: EDataType | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEAttribute();
  }

  isID(): boolean {
    return this._iD;
  }

  setID(value: boolean): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEAttribute_ID(), value);
  }
  getEAttributeType(): EDataType | undefined {
    return this._eAttributeType;
  }

  setEAttributeType(value: EDataType | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEAttribute_EAttributeType(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 18: return this._iD;
      case 19: return this._eAttributeType;
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
      default:
        super.eSet(feature, value);
        return;
    }
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 18: this._iD = value as boolean; return;
      case 19: this._eAttributeType = value as EDataType | undefined; return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 18: return this._iD !== false;
      case 19: return this._eAttributeType !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 18: {
        const oldValue = this._iD;
        this._iD = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 19: {
        const oldValue = this._eAttributeType;
        this._eAttributeType = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
