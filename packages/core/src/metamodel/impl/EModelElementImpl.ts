import {
  EAnnotation,
  EClass,
  EList,
  EModelElement,
  EStructuralFeature,
} from "../../index.js";
import { BasicEList, EcorePackageImpl, EObjectImpl } from "./index.js";

export class EModelElementImpl extends EObjectImpl implements EModelElement {
  private readonly _eAnnotations = new BasicEList<EAnnotation>(
    this,
    EcorePackageImpl.eINSTANCE.getEModelElement_EAnnotations(),
  );

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEModelElement();
  }

  getEAnnotations(): EList<EAnnotation> {
    return this._eAnnotations;
  }

  getEAnnotation(source: string): EAnnotation {
    throw new Error(
      "EModelElement.getEAnnotation() has no body:typescript annotation - nothing to generate.",
    );
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 0:
        return this._eAnnotations;
      default:
        throw new Error(
          `EModelElement has no feature with id ${feature.getFeatureID()}`,
        );
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 0: {
        const list = this._eAnnotations;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EAnnotation);
        return;
      }
      default:
        throw new Error(
          `EModelElement has no feature with id ${feature.getFeatureID()}`,
        );
    }
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      default:
        throw new Error(
          `Feature ${feature.getFeatureID()} on EModelElement is many-valued or unknown.`,
        );
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 0:
        return this._eAnnotations.size() !== 0;
      default:
        throw new Error(
          `EModelElement has no feature with id ${feature.getFeatureID()}`,
        );
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 0:
        this._eAnnotations.clear();
        return;
      default:
        throw new Error(
          `EModelElement has no feature with id ${feature.getFeatureID()}`,
        );
    }
  }
}
