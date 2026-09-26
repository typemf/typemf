import { EEnumerator, EClass, EStructuralFeature } from "../types/index.js";
import { EObjectImpl, BasicEList } from "./index.js";
import { EEnumLiteral } from "../types/EEnumLiteral.js";
import { EcorePackageImpl } from "./EcorePackageImpl.js";
import { EEnum } from "../types/EEnum.js";
import { ENamedElementImpl } from "./ENamedElementImpl.js";

export class EEnumLiteralImpl
  extends ENamedElementImpl
  implements EEnumLiteral
{
  private _value: number = 0;
  private _instance: EEnumerator | undefined;
  private _literal: string | undefined;
  private _eEnum: EEnum | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEEnumLiteral();
  }

  getValue(): number {
    return this._value;
  }

  setValue(value: number): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEEnumLiteral_Value(), value);
  }
  getInstance(): EEnumerator | undefined {
    return this._instance;
  }

  setInstance(value: EEnumerator | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEEnumLiteral_Instance(), value);
  }
  getLiteral(): string | undefined {
    return this._literal;
  }

  setLiteral(value: string | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEEnumLiteral_Literal(), value);
  }
  getEEnum(): EEnum | undefined {
    return this._eEnum;
  }

  setEEnum(value: EEnum | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEEnumLiteral_EEnum(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 2:
        return this._value;
      case 3:
        return this._instance;
      case 4:
        return this._literal;
      case 5:
        return this._eEnum;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 2: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 3: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 4: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 5: {
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
      case 2:
        this._value = value as number;
        return;
      case 3:
        this._instance = value as EEnumerator | undefined;
        return;
      case 4:
        this._literal = value as string | undefined;
        return;
      case 5:
        this._eEnum = value as EEnum | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 2:
        return this._value !== 0;
      case 3:
        return this._instance !== undefined;
      case 4:
        return this._literal !== undefined;
      case 5:
        return this._eEnum !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 2: {
        const oldValue = this._value;
        this._value = 0;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 3: {
        const oldValue = this._instance;
        this._instance = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 4: {
        const oldValue = this._literal;
        this._literal = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 5: {
        const oldValue = this._eEnum;
        this._eEnum = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
