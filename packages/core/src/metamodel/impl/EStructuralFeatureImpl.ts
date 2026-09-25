import { EClass, EStructuralFeature } from "../../index.js";
import { EcorePackageImpl, ETypedElementImpl } from "./index.js";

export class EStructuralFeatureImpl
  extends ETypedElementImpl
  implements EStructuralFeature
{
  private _changeable: boolean | undefined;
  private _volatile: boolean | undefined;
  private _transient: boolean | undefined;
  private _defaultValueLiteral: string | undefined;
  private _defaultValue: EJavaObject | undefined;
  private _unsettable: boolean | undefined;
  private _derived: boolean | undefined;
  private _eContainingClass: EClass | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEStructuralFeature();
  }

  getChangeable(): boolean | undefined {
    return this._changeable;
  }

  setChangeable(value: boolean | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEStructuralFeature_Changeable(),
      value,
    );
  }
  getVolatile(): boolean | undefined {
    return this._volatile;
  }

  setVolatile(value: boolean | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEStructuralFeature_Volatile(),
      value,
    );
  }
  getTransient(): boolean | undefined {
    return this._transient;
  }

  setTransient(value: boolean | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEStructuralFeature_Transient(),
      value,
    );
  }
  getDefaultValueLiteral(): string | undefined {
    return this._defaultValueLiteral;
  }

  setDefaultValueLiteral(value: string | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEStructuralFeature_DefaultValueLiteral(),
      value,
    );
  }
  getDefaultValue(): EJavaObject | undefined {
    return this._defaultValue;
  }

  setDefaultValue(value: EJavaObject | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEStructuralFeature_DefaultValue(),
      value,
    );
  }
  getUnsettable(): boolean | undefined {
    return this._unsettable;
  }

  setUnsettable(value: boolean | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEStructuralFeature_Unsettable(),
      value,
    );
  }
  getDerived(): boolean | undefined {
    return this._derived;
  }

  setDerived(value: boolean | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEStructuralFeature_Derived(),
      value,
    );
  }
  getEContainingClass(): EClass | undefined {
    return this._eContainingClass;
  }

  setEContainingClass(value: EClass | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEStructuralFeature_EContainingClass(),
      value,
    );
  }

  getFeatureID(): number {
    throw new Error(
      "EStructuralFeature.getFeatureID() has no body:typescript annotation - nothing to generate.",
    );
  }

  getContainerClass(): EJavaClass {
    throw new Error(
      "EStructuralFeature.getContainerClass() has no body:typescript annotation - nothing to generate.",
    );
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 10:
        return this._changeable;
      case 11:
        return this._volatile;
      case 12:
        return this._transient;
      case 13:
        return this._defaultValueLiteral;
      case 14:
        return this._defaultValue;
      case 15:
        return this._unsettable;
      case 16:
        return this._derived;
      case 17:
        return this._eContainingClass;
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
      case 11: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 12: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 13: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 14: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 15: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 16: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 17: {
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
      case 10:
        this._changeable = value as boolean | undefined;
        return;
      case 11:
        this._volatile = value as boolean | undefined;
        return;
      case 12:
        this._transient = value as boolean | undefined;
        return;
      case 13:
        this._defaultValueLiteral = value as string | undefined;
        return;
      case 14:
        this._defaultValue = value as EJavaObject | undefined;
        return;
      case 15:
        this._unsettable = value as boolean | undefined;
        return;
      case 16:
        this._derived = value as boolean | undefined;
        return;
      case 17:
        this._eContainingClass = value as EClass | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 10:
        return this._changeable !== undefined;
      case 11:
        return this._volatile !== undefined;
      case 12:
        return this._transient !== undefined;
      case 13:
        return this._defaultValueLiteral !== undefined;
      case 14:
        return this._defaultValue !== undefined;
      case 15:
        return this._unsettable !== undefined;
      case 16:
        return this._derived !== undefined;
      case 17:
        return this._eContainingClass !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 10: {
        const oldValue = this._changeable;
        this._changeable = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 11: {
        const oldValue = this._volatile;
        this._volatile = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 12: {
        const oldValue = this._transient;
        this._transient = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 13: {
        const oldValue = this._defaultValueLiteral;
        this._defaultValueLiteral = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 14: {
        const oldValue = this._defaultValue;
        this._defaultValue = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 15: {
        const oldValue = this._unsettable;
        this._unsettable = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 16: {
        const oldValue = this._derived;
        this._derived = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 17: {
        const oldValue = this._eContainingClass;
        this._eContainingClass = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
