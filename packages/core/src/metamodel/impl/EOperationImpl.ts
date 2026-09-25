import {
  EClass,
  EClassifier,
  EGenericType,
  EList,
  EOperation,
  EParameter,
  EStructuralFeature,
  ETypeParameter,
} from "../../index.js";
import { BasicEList, EcorePackageImpl, ETypedElementImpl } from "./index.js";

export class EOperationImpl extends ETypedElementImpl implements EOperation {
  private _eContainingClass: EClass | undefined;
  private readonly _eTypeParameters = new BasicEList<ETypeParameter>(
    this,
    EcorePackageImpl.eINSTANCE.getEOperation_ETypeParameters(),
  );
  private readonly _eParameters = new BasicEList<EParameter>(
    this,
    EcorePackageImpl.eINSTANCE.getEOperation_EParameters(),
  );
  private readonly _eExceptions = new BasicEList<EClassifier>(
    this,
    EcorePackageImpl.eINSTANCE.getEOperation_EExceptions(),
  );
  private readonly _eGenericExceptions = new BasicEList<EGenericType>(
    this,
    EcorePackageImpl.eINSTANCE.getEOperation_EGenericExceptions(),
  );

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEOperation();
  }

  getEContainingClass(): EClass | undefined {
    return this._eContainingClass;
  }

  setEContainingClass(value: EClass | undefined): void {
    this.eSet(
      EcorePackageImpl.eINSTANCE.getEOperation_EContainingClass(),
      value,
    );
  }
  getETypeParameters(): EList<ETypeParameter> {
    return this._eTypeParameters;
  }
  getEParameters(): EList<EParameter> {
    return this._eParameters;
  }
  getEExceptions(): EList<EClassifier> {
    return this._eExceptions;
  }
  getEGenericExceptions(): EList<EGenericType> {
    return this._eGenericExceptions;
  }

  getOperationID(): number {
    throw new Error(
      "EOperation.getOperationID() has no body:typescript annotation - nothing to generate.",
    );
  }

  isOverrideOf(someOperation: EOperation): boolean {
    throw new Error(
      "EOperation.isOverrideOf() has no body:typescript annotation - nothing to generate.",
    );
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 10:
        return this._eContainingClass;
      case 11:
        return this._eTypeParameters;
      case 12:
        return this._eParameters;
      case 13:
        return this._eExceptions;
      case 14:
        return this._eGenericExceptions;
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
        const list = this._eTypeParameters;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as ETypeParameter);
        return;
      }
      case 12: {
        const list = this._eParameters;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EParameter);
        return;
      }
      case 13: {
        const list = this._eExceptions;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EClassifier);
        return;
      }
      case 14: {
        const list = this._eGenericExceptions;
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
      case 10:
        this._eContainingClass = value as EClass | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 10:
        return this._eContainingClass !== undefined;
      case 11:
        return this._eTypeParameters.size() !== 0;
      case 12:
        return this._eParameters.size() !== 0;
      case 13:
        return this._eExceptions.size() !== 0;
      case 14:
        return this._eGenericExceptions.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 10: {
        const oldValue = this._eContainingClass;
        this._eContainingClass = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 11:
        this._eTypeParameters.clear();
        return;
      case 12:
        this._eParameters.clear();
        return;
      case 13:
        this._eExceptions.clear();
        return;
      case 14:
        this._eGenericExceptions.clear();
        return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
