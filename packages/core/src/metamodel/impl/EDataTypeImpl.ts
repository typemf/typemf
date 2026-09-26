import { EClass, EStructuralFeature } from "../types/index.js";
import { EDataType } from "../types/EDataType.js";
import { EcorePackageImpl } from "./EcorePackageImpl.js";
import { EClassifierImpl } from "./EClassifierImpl.js";

export class EDataTypeImpl extends EClassifierImpl implements EDataType {
  private _serializable: boolean = false;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEDataType();
  }

  isSerializable(): boolean {
    return this._serializable;
  }

  setSerializable(value: boolean): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEDataType_Serializable(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 8:
        return this._serializable;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 8: {
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
      case 8:
        this._serializable = value as boolean;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 8:
        return this._serializable !== false;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 8: {
        const oldValue = this._serializable;
        this._serializable = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
