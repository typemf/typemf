import { EClass, EStructuralFeature } from "../types/index.js";
import { EObjectImpl, BasicEList } from "./index.js";
import { ENamedElement } from "../types/ENamedElement.js";
import { EcorePackageImpl } from "./EcorePackageImpl.js";
import { EModelElementImpl } from "./EModelElementImpl.js";

export class ENamedElementImpl
  extends EModelElementImpl
  implements ENamedElement
{
  private _name: string | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getENamedElement();
  }

  getName(): string | undefined {
    return this._name;
  }

  setName(value: string | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getENamedElement_Name(), value);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 1:
        return this._name;
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
        this._name = value as string | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 1:
        return this._name !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 1: {
        const oldValue = this._name;
        this._name = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
