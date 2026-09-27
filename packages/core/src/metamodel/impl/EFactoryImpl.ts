import { EObject } from '../types/EObject.js';
import { EDataType } from '../types/EDataType.js';
import { EClass } from '../types/EClass.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { BasicEList } from './BasicEList.js';
import { EFactory } from '../types/EFactory.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EPackage } from '../types/EPackage.js';
import { EModelElementImpl } from './EModelElementImpl.js';


export class EFactoryImpl extends EModelElementImpl implements EFactory {
  private _ePackage: EPackage | undefined;


  eClass(): EClass {
    return getEcorePackageRef().getEFactory();
  }

  getEPackage(): EPackage | undefined {
    return this._ePackage;
  }

  setEPackage(value: EPackage | undefined): void {
    this.eSet(getEcorePackageRef().getEFactory_EPackage(), value);
  }

  create(eClass: EClass): EObject | undefined {
    throw new Error('EFactory.create() has no body:typescript annotation - nothing to generate.');
  }

  createFromString(eDataType: EDataType, literalValue: string): unknown | undefined {
    throw new Error('EFactory.createFromString() has no body:typescript annotation - nothing to generate.');
  }

  convertToString(eDataType: EDataType, instanceValue: unknown): string | undefined {
    throw new Error('EFactory.convertToString() has no body:typescript annotation - nothing to generate.');
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 1: return this._ePackage;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 1: {
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
      case 1: this._ePackage = value as EPackage | undefined; return;
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
      case 1: return this._ePackage !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 1: {
        const oldValue = this._ePackage;
        this._ePackage = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
