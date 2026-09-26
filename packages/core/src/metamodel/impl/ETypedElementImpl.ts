import { EClass, EStructuralFeature } from "../types/index.js";
import { ETypedElement } from "../types/ETypedElement.js";
import { EcorePackageImpl } from "./EcorePackageImpl.js";
import { EClassifier } from "../types/EClassifier.js";
import { EGenericType } from "../types/EGenericType.js";
import { ENamedElementImpl } from "./ENamedElementImpl.js";

export class ETypedElementImpl
  extends ENamedElementImpl
  implements ETypedElement
{
  private _ordered: boolean = false;
  private _unique: boolean = false;
  private _lowerBound: number = 0;
  private _upperBound: number = 0;
  private _many: boolean = false;
  private _required: boolean = false;
  private _eType: EClassifier | undefined;
  private _eGenericType: EGenericType | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getETypedElement();
  }

  isOrdered(): boolean {
    return this._ordered;
  }

  setOrdered(value: boolean): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_Ordered(), value);
  }
  isUnique(): boolean {
    return this._unique;
  }

  setUnique(value: boolean): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_Unique(), value);
  }
  getLowerBound(): number {
    return this._lowerBound;
  }

  setLowerBound(value: number): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_LowerBound(), value);
  }
  getUpperBound(): number {
    return this._upperBound;
  }

  setUpperBound(value: number): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_UpperBound(), value);
  }
  isMany(): boolean {
    return this.getUpperBound() === -1 || this.getUpperBound() > 1;
  }
  isRequired(): boolean {
    return this.getLowerBound() >= 1;
  }
  getEType(): EClassifier | undefined {
    return this._eType;
  }

  setEType(value: EClassifier | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_EType(), value);
  }
  getEGenericType(): EGenericType | undefined {
    return this._eGenericType;
  }

  setEGenericType(value: EGenericType | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getETypedElement_EGenericType(),
      value,
    );
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 2:
        return this._ordered;
      case 3:
        return this._unique;
      case 4:
        return this._lowerBound;
      case 5:
        return this._upperBound;
      case 6:
        return this._many;
      case 7:
        return this._required;
      case 8:
        return this._eType;
      case 9:
        return this._eGenericType;
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
      case 6: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 7: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 8: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 9: {
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
        this._ordered = value as boolean;
        return;
      case 3:
        this._unique = value as boolean;
        return;
      case 4:
        this._lowerBound = value as number;
        return;
      case 5:
        this._upperBound = value as number;
        return;
      case 6:
        this._many = value as boolean;
        return;
      case 7:
        this._required = value as boolean;
        return;
      case 8:
        this._eType = value as EClassifier | undefined;
        return;
      case 9:
        this._eGenericType = value as EGenericType | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 2:
        return this._ordered !== false;
      case 3:
        return this._unique !== false;
      case 4:
        return this._lowerBound !== 0;
      case 5:
        return this._upperBound !== 0;
      case 6:
        return this._many !== false;
      case 7:
        return this._required !== false;
      case 8:
        return this._eType !== undefined;
      case 9:
        return this._eGenericType !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 2: {
        const oldValue = this._ordered;
        this._ordered = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 3: {
        const oldValue = this._unique;
        this._unique = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 4: {
        const oldValue = this._lowerBound;
        this._lowerBound = 0;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 5: {
        const oldValue = this._upperBound;
        this._upperBound = 0;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 6: {
        const oldValue = this._many;
        this._many = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 7: {
        const oldValue = this._required;
        this._required = false;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 8: {
        const oldValue = this._eType;
        this._eType = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 9: {
        const oldValue = this._eGenericType;
        this._eGenericType = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
