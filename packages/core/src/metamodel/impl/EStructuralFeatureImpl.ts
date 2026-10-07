import { BasicEList } from './BasicEList.js';
import { EObjectImpl } from './EObjectImpl.js';
import { ETypedElementImpl } from './ETypedElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { TypeScriptClass } from '../types/TypeScriptClass.js';
import { isEDataType } from '../util/EcoreTypeGuards.js';

/** An attribute or a reference of a class. */
export class EStructuralFeatureImpl extends ETypedElementImpl implements EStructuralFeature {
  private _changeable: boolean = true;

  private _volatile: boolean = false;

  private _transient: boolean = false;

  private _defaultValueLiteral: string | undefined;

  private _defaultValueCache: unknown | undefined;
  private _defaultValueCacheGeneration = -1;

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
    if (this._defaultValueCacheGeneration !== EObjectImpl.getModelGeneration()) {
      this._defaultValueCache = (() => {
        const type = this.getEType();
        if (type === undefined || this.isMany()) return undefined;
        const literal = this.getDefaultValueLiteral();
        const factory = type.getEPackage()?.getEFactoryInstance();
        if (literal !== undefined && factory !== undefined && isEDataType(type))
          return factory.createFromString(type, literal);
        return type.getDefaultValue();
      })();
      this._defaultValueCacheGeneration = EObjectImpl.getModelGeneration();
    }
    return this._defaultValueCache!;
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
    this.requireOwnFeature(feature);
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
        return this.getDefaultValue();
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
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 10: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      case 11: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      case 12: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      case 13: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      case 15: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
        return;
      }
      case 16: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
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
      case 10:
        this._changeable = value as boolean;
        return;
      case 11:
        this._volatile = value as boolean;
        return;
      case 12:
        this._transient = value as boolean;
        return;
      case 13:
        this._defaultValueLiteral = value as string | undefined;
        return;
      case 15:
        this._unsettable = value as boolean;
        return;
      case 16:
        this._derived = value as boolean;
        return;
      case 17:
        this._eContainingClass = value as EClass | undefined;
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
        return this._changeable !== true;
      case 11:
        return this._volatile !== false;
      case 12:
        return this._transient !== false;
      case 13:
        return this._defaultValueLiteral !== undefined;

      case 14:
        return this.getDefaultValue() !== undefined;
      case 15:
        return this._unsettable !== false;
      case 16:
        return this._derived !== false;
      case 17:
        return this._eContainingClass !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 10: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._changeable;
        this._changeable = true;
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

      case 11: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._volatile;
        this._volatile = false;
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

      case 12: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._transient;
        this._transient = false;
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

      case 13: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._defaultValueLiteral;
        this._defaultValueLiteral = undefined;
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

      case 15: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._unsettable;
        this._unsettable = false;
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

      case 16: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._derived;
        this._derived = false;
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

      case 17: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eContainingClass;
        this._eContainingClass = undefined;
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
