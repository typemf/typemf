import { BasicEList } from './BasicEList.js';
import { ENamedElementImpl } from './ENamedElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EClassifier } from '../types/EClassifier.js';
import { EGenericType } from '../types/EGenericType.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { ETypedElement } from '../types/ETypedElement.js';

export class ETypedElementImpl extends ENamedElementImpl implements ETypedElement {
  private _ordered: boolean = true;

  private _unique: boolean = true;

  private _lowerBound: number = 0;

  private _upperBound: number = 1;

  private _many: boolean = false;

  private _required: boolean = false;

  private _eType: EClassifier | undefined;

  private _eGenericType: EGenericType | undefined;

  eClass(): EClass {
    return getEcorePackageRef().getETypedElement();
  }

  isOrdered(): boolean {
    return this._ordered;
  }
  setOrdered(value: boolean): void {
    this.eSet(getEcorePackageRef().getETypedElement_Ordered(), value);
  }
  isUnique(): boolean {
    return this._unique;
  }
  setUnique(value: boolean): void {
    this.eSet(getEcorePackageRef().getETypedElement_Unique(), value);
  }
  getLowerBound(): number {
    return this._lowerBound;
  }
  setLowerBound(value: number): void {
    this.eSet(getEcorePackageRef().getETypedElement_LowerBound(), value);
  }
  getUpperBound(): number {
    return this._upperBound;
  }
  setUpperBound(value: number): void {
    this.eSet(getEcorePackageRef().getETypedElement_UpperBound(), value);
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
    const oldValue = this._eType;
    const wasSet = this._eType !== undefined;
    this._eType = value;
    this._eGenericType = undefined;
    this.eDidAdd(undefined, value);
    const feature = getEcorePackageRef().getETypedElement_EType();
    this.eNotify({ eventType: 'SET', notifier: this, feature, oldValue, newValue: value, position: undefined, wasSet });
  }
  getEGenericType(): EGenericType | undefined {
    return this._eGenericType;
  }

  setEGenericType(value: EGenericType | undefined): void {
    const feature = getEcorePackageRef().getETypedElement_EGenericType();
    const oldValue = this.eGet(feature);
    const wasSet = this.eIsSet(feature);
    this.eBasicSetValue(feature, value);
    this.eDidRemove(feature, oldValue);
    this.eDidAdd(feature, value);
    this.eNotify({ eventType: 'SET', notifier: this, feature, oldValue, newValue: value, position: undefined, wasSet });
    const oldEType = this._eType;
    const eTypeWasSet = oldEType !== undefined;
    this._eType = value?.getERawType();
    const eTypeFeature = getEcorePackageRef().getETypedElement_EType();
    this.eNotify({
      eventType: 'SET',
      notifier: this,
      feature: eTypeFeature,
      oldValue: oldEType,
      newValue: this._eType,
      position: undefined,
      wasSet: eTypeWasSet,
    });
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
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
        return this.isMany();

      case 7:
        return this.isRequired();
      case 8:
        return this._eType;
      case 9:
        return this._eGenericType;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2: {
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
      case 3: {
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
      case 4: {
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
      case 5: {
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
      case 8: {
        this.setEType(value as EClassifier | undefined);
        return;
      }
      case 9: {
        this.setEGenericType(value as EGenericType | undefined);
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
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2:
        return this._ordered !== true;
      case 3:
        return this._unique !== true;
      case 4:
        return this._lowerBound !== 0;
      case 5:
        return this._upperBound !== 1;
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
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._ordered;
        this._ordered = true;
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

      case 3: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._unique;
        this._unique = true;
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

      case 4: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._lowerBound;
        this._lowerBound = 0;
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

      case 5: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._upperBound;
        this._upperBound = 1;
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

      case 6: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._many;
        this._many = false;
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

      case 7: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._required;
        this._required = false;
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

      case 8: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eType;
        this._eType = undefined;
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

      case 9: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eGenericType;
        this._eGenericType = undefined;
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
