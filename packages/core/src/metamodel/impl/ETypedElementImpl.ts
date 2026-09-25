import {
  EClass,
  EClassifier,
  EGenericType,
  EStructuralFeature,
  ETypedElement,
} from "../../index.js";
import { EcorePackageImpl, ENamedElementImpl } from "./index.js";

export class ETypedElementImpl
  extends ENamedElementImpl
  implements ETypedElement
{
  private _ordered: boolean | undefined;
  private _unique: boolean | undefined;
  private _lowerBound: number | undefined;
  private _upperBound: number | undefined;
  private _many: boolean | undefined;
  private _required: boolean | undefined;
  private _eType: EClassifier | undefined;
  private _eGenericType: EGenericType | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getETypedElement();
  }

  isOrdered(): boolean | undefined {
    return this._ordered;
  }

  setOrdered(value: boolean | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_Ordered(), value);
  }
  isUnique(): boolean | undefined {
    return this._unique;
  }

  setUnique(value: boolean | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_Unique(), value);
  }
  getLowerBound(): number | undefined {
    return this._lowerBound;
  }

  setLowerBound(value: number | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_LowerBound(), value);
  }
  getUpperBound(): number | undefined {
    return this._upperBound;
  }

  setUpperBound(value: number | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getETypedElement_UpperBound(), value);
  }
  isMany(): boolean | undefined {
    const upperBound = this.getUpperBound();

    if (upperBound === undefined) {
      return false;
    }

    return this.getUpperBound() === -1 || upperBound > 1;
  }
  isRequired(): boolean | undefined {
    const lowerBound = this.getLowerBound();

    if (lowerBound === undefined) {
      return false;
    }

    return lowerBound >= 1;
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
        this._ordered = value as boolean | undefined;
        return;
      case 3:
        this._unique = value as boolean | undefined;
        return;
      case 4:
        this._lowerBound = value as number | undefined;
        return;
      case 5:
        this._upperBound = value as number | undefined;
        return;
      case 6:
        this._many = value as boolean | undefined;
        return;
      case 7:
        this._required = value as boolean | undefined;
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
        return this._ordered !== undefined;
      case 3:
        return this._unique !== undefined;
      case 4:
        return this._lowerBound !== undefined;
      case 5:
        return this._upperBound !== undefined;
      case 6:
        return this._many !== undefined;
      case 7:
        return this._required !== undefined;
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
        this._ordered = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 3: {
        const oldValue = this._unique;
        this._unique = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 4: {
        const oldValue = this._lowerBound;
        this._lowerBound = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 5: {
        const oldValue = this._upperBound;
        this._upperBound = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 6: {
        const oldValue = this._many;
        this._many = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 7: {
        const oldValue = this._required;
        this._required = undefined;
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
