import {
  EClass,
  EEnum,
  EEnumLiteral,
  EList,
  EStructuralFeature,
} from "../../index.js";
import { BasicEList, EcorePackageImpl, EDataTypeImpl } from "./index.js";

export class EEnumImpl extends EDataTypeImpl implements EEnum {
  private readonly _eLiterals = new BasicEList<EEnumLiteral>(
    this,
    EcorePackageImpl.eINSTANCE.getEEnum_ELiterals(),
  );

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEEnum();
  }

  getELiterals(): EList<EEnumLiteral> {
    return this._eLiterals;
  }

  getEEnumLiteral(name: string): EEnumLiteral {
    throw new Error(
      "EEnum.getEEnumLiteral() has no body:typescript annotation - nothing to generate.",
    );
  }

  getEEnumLiteral(value: number): EEnumLiteral {
    throw new Error(
      "EEnum.getEEnumLiteral() has no body:typescript annotation - nothing to generate.",
    );
  }

  getEEnumLiteralByLiteral(literal: string): EEnumLiteral {
    throw new Error(
      "EEnum.getEEnumLiteralByLiteral() has no body:typescript annotation - nothing to generate.",
    );
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 9:
        return this._eLiterals;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 9: {
        const list = this._eLiterals;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EEnumLiteral);
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
      case 9:
        return this._eLiterals.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 9:
        this._eLiterals.clear();
        return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
