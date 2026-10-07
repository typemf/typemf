import { BasicEList } from './BasicEList.js';
import { EModelElementImpl } from './EModelElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { ENamedElement } from '../types/ENamedElement.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';

/** A model element with a name. */
export class ENamedElementImpl extends EModelElementImpl implements ENamedElement {
  private _name: string | undefined;

  eClass(): EClass {
    return getEcorePackageRef().getENamedElement();
  }

  getName(): string | undefined {
    return this._name;
  }
  setName(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getENamedElement_Name(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1:
        return this._name;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1: {
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
      case 1:
        this._name = value as string | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  /** @internal The list of the many-valued feature `featureId`, for bootstrapping the package. */
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1:
        return this._name !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._name;
        this._name = undefined;
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
