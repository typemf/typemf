import { EClass, EDataType, EStructuralFeature } from "../../index.js";
import { EClassifierImpl, EcorePackageImpl } from "./index.js";

export class EDataTypeImpl extends EClassifierImpl implements EDataType {
  private _serializable: boolean | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEDataType();
  }

  getSerializable(): boolean | undefined {
    return this._serializable;
  }

  setSerializable(value: boolean | undefined): void {
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
        this._serializable = value as boolean | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 8:
        return this._serializable !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 8: {
        const oldValue = this._serializable;
        this._serializable = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
