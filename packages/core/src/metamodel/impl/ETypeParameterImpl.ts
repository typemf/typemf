import { EClass, EList, EStructuralFeature } from "../types/index.js";
import { EObjectImpl, BasicEList } from "./index.js";
import { ETypeParameter } from "../types/ETypeParameter.js";
import { EcorePackageImpl } from "./EcorePackageImpl.js";
import { EGenericType } from "../types/EGenericType.js";
import { ENamedElementImpl } from "./ENamedElementImpl.js";

export class ETypeParameterImpl
  extends ENamedElementImpl
  implements ETypeParameter
{
  private readonly _eBounds = new BasicEList<EGenericType>(
    this,
    EcorePackageImpl.eINSTANCE.getETypeParameter_EBounds(),
  );

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getETypeParameter();
  }

  getEBounds(): EList<EGenericType> {
    return this._eBounds;
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 2:
        return this._eBounds;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 2: {
        const list = this._eBounds;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EGenericType);
        return;
      }
      default:
        super.eSet(feature, value);
        return;
    }
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 2:
        return this._eBounds.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 2:
        this._eBounds.clear();
        return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
