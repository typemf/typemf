import { BasicEList } from './BasicEList.js';
import { ETypedElementImpl } from './ETypedElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { TypeScriptClass } from '../types/TypeScriptClass.js';



export class EStructuralFeatureImpl extends ETypedElementImpl implements EStructuralFeature {

  private _changeable: boolean = true;

  private _volatile: boolean = false;

  private _transient: boolean = false;

  private _defaultValueLiteral: string | undefined;

  private _defaultValue: unknown;

  private _unsettable: boolean = false;

  private _derived: boolean = false;

  private _eContainingClass: EClass | undefined;


  private featureId = -1;

  getFeatureID(): number {
    return this.featureId;
  }

  setFeatureID(id: number): void {
    this.featureId = id;
  }
  private containerClass: TypeScriptClass<unknown> | undefined;

  getContainerClass(): TypeScriptClass<unknown> | undefined {
    return this.containerClass;
  }

  setContainerClass(cls: TypeScriptClass<unknown> | undefined): void {
    this.containerClass = cls;
  }

  eClass(): EClass {
    return getEcorePackageRef().getEStructuralFeature();
  }

  isChangeable(): boolean {
    return this._changeable;
  }
  setChangeable(value: boolean): void {
    this.eSet(getEcorePackageRef().getEStructuralFeature_Changeable(), value);
  }
  isVolatile(): boolean {
    return this._volatile;
  }
  setVolatile(value: boolean): void {
    this.eSet(getEcorePackageRef().getEStructuralFeature_Volatile(), value);
  }
  isTransient(): boolean {
    return this._transient;
  }
  setTransient(value: boolean): void {
    this.eSet(getEcorePackageRef().getEStructuralFeature_Transient(), value);
  }
  getDefaultValueLiteral(): string | undefined {
    return this._defaultValueLiteral;
  }
  setDefaultValueLiteral(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEStructuralFeature_DefaultValueLiteral(), value);
  }
  getDefaultValue(): unknown {
    return this._defaultValue;
  }

  setDefaultValue(value: unknown): void {
    this._defaultValue = value;
  }
  isUnsettable(): boolean {
    return this._unsettable;
  }
  setUnsettable(value: boolean): void {
    this.eSet(getEcorePackageRef().getEStructuralFeature_Unsettable(), value);
  }
  isDerived(): boolean {
    return this._derived;
  }
  setDerived(value: boolean): void {
    this.eSet(getEcorePackageRef().getEStructuralFeature_Derived(), value);
  }
  getEContainingClass(): EClass | undefined {
    return this._eContainingClass;
  }

  setEContainingClass(value: EClass | undefined): void {
    this._eContainingClass = value;
  }



  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 10: return this._changeable;
      case 11: return this._volatile;
      case 12: return this._transient;
      case 13: return this._defaultValueLiteral;
      case 14: return this._defaultValue;
      case 15: return this._unsettable;
      case 16: return this._derived;
      case 17: return this._eContainingClass;
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
      default:
        super.eSet(feature, value);
        return;
    }
  }
  eBasicSetValue(feature: EStructuralFeature | number, value: unknown): void {
    const featureId = typeof feature === 'number' ? feature : feature.getFeatureID();
    switch (featureId) {
      case 10: this._changeable = value as boolean; return;
      case 11: this._volatile = value as boolean; return;
      case 12: this._transient = value as boolean; return;
      case 13: this._defaultValueLiteral = value as string | undefined; return;
      case 14: this._defaultValue = value as unknown; return;
      case 15: this._unsettable = value as boolean; return;
      case 16: this._derived = value as boolean; return;
      case 17: this._eContainingClass = value as EClass | undefined; return;
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
      case 10: return this._changeable !== true;
      case 11: return this._volatile !== false;
      case 12: return this._transient !== false;
      case 13: return this._defaultValueLiteral !== undefined;
      case 14: return this._defaultValue !== undefined;
      case 15: return this._unsettable !== false;
      case 16: return this._derived !== false;
      case 17: return this._eContainingClass !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {

      case 10: {
        const oldValue = this._changeable;
        this._changeable = true;
        this.eDidRemove(feature, oldValue);
        return;
      }


      case 11: {
        const oldValue = this._volatile;
        this._volatile = false;
        this.eDidRemove(feature, oldValue);
        return;
      }


      case 12: {
        const oldValue = this._transient;
        this._transient = false;
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
        this._unsettable = false;
        this.eDidRemove(feature, oldValue);
        return;
      }


      case 16: {
        const oldValue = this._derived;
        this._derived = false;
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
