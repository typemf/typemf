import {
  EClass,
  EDataType,
  EObject,
  EStructuralFeature,
} from "../types/index.js";
import { EObjectImpl, BasicEList } from "./index.js";
import { EFactory } from "../types/EFactory.js";
import { EcorePackageImpl } from "./EcorePackageImpl.js";
import { EPackage } from "../types/EPackage.js";
import { EModelElementImpl } from "./EModelElementImpl.js";

export class EFactoryImpl extends EModelElementImpl implements EFactory {
  private _ePackage: EPackage | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEFactory();
  }

  getEPackage(): EPackage | undefined {
    return this._ePackage;
  }

  setEPackage(value: EPackage | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEFactory_EPackage(), value);
  }

  create(eClass: EClass): EObject {
    throw new Error(
      "EFactory.create() has no body:typescript annotation - nothing to generate.",
    );
  }

  createFromString(eDataType: EDataType, literalValue: string): unknown {
    throw new Error(
      "EFactory.createFromString() has no body:typescript annotation - nothing to generate.",
    );
  }

  convertToString(eDataType: EDataType, instanceValue: unknown): string {
    throw new Error(
      "EFactory.convertToString() has no body:typescript annotation - nothing to generate.",
    );
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 1:
        return this._ePackage;
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

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 1:
        this._ePackage = value as EPackage | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 1:
        return this._ePackage !== undefined;
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
