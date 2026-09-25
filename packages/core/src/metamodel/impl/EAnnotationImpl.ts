import {
  EAnnotation,
  EClass,
  EList,
  EModelElement,
  EObject,
  EStringToStringMapEntry,
  EStructuralFeature,
} from "../../index.js";
import { BasicEList, EcorePackageImpl, EModelElementImpl } from "./index.js";

export class EAnnotationImpl extends EModelElementImpl implements EAnnotation {
  private _source: string | undefined;
  private readonly _details = new BasicEList<EStringToStringMapEntry>(
    this,
    EcorePackageImpl.eINSTANCE.getEAnnotation_Details(),
  );
  private _eModelElement: EModelElement | undefined;
  private readonly _contents = new BasicEList<EObject>(
    this,
    EcorePackageImpl.eINSTANCE.getEAnnotation_Contents(),
  );
  private readonly _references = new BasicEList<EObject>(
    this,
    EcorePackageImpl.eINSTANCE.getEAnnotation_References(),
  );

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEAnnotation();
  }

  getSource(): string | undefined {
    return this._source;
  }

  setSource(value: string | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEAnnotation_Source(), value);
  }
  getDetails(): EList<EStringToStringMapEntry> {
    return this._details;
  }
  getEModelElement(): EModelElement | undefined {
    return this._eModelElement;
  }

  setEModelElement(value: EModelElement | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEAnnotation_EModelElement(), value);
  }
  getContents(): EList<EObject> {
    return this._contents;
  }
  getReferences(): EList<EObject> {
    return this._references;
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 1:
        return this._source;
      case 2:
        return this._details;
      case 3:
        return this._eModelElement;
      case 4:
        return this._contents;
      case 5:
        return this._references;
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
      case 2: {
        const list = this._details;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EStringToStringMapEntry);
        return;
      }
      case 3: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 4: {
        const list = this._contents;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EObject);
        return;
      }
      case 5: {
        const list = this._references;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EObject);
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
        this._source = value as string | undefined;
        return;
      case 3:
        this._eModelElement = value as EModelElement | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 1:
        return this._source !== undefined;
      case 2:
        return this._details.size() !== 0;
      case 3:
        return this._eModelElement !== undefined;
      case 4:
        return this._contents.size() !== 0;
      case 5:
        return this._references.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 1: {
        const oldValue = this._source;
        this._source = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 2:
        this._details.clear();
        return;
      case 3: {
        const oldValue = this._eModelElement;
        this._eModelElement = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 4:
        this._contents.clear();
        return;
      case 5:
        this._references.clear();
        return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
