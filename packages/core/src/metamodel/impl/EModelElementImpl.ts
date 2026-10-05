import { BasicEList } from './BasicEList.js';
import { EObjectImpl } from './EObjectImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EAnnotation } from '../types/EAnnotation.js';
import { EClass } from '../types/EClass.js';
import { EList } from '../types/EList.js';
import { EModelElement } from '../types/EModelElement.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';

export class EModelElementImpl extends EObjectImpl implements EModelElement {
  private _eAnnotationsCache: BasicEList<EAnnotation> | undefined;

  private get _eAnnotations(): BasicEList<EAnnotation> {
    this._eAnnotationsCache ??= new BasicEList<EAnnotation>(this, getEcorePackageRef().getEModelElement_EAnnotations());
    return this._eAnnotationsCache;
  }

  eClass(): EClass {
    return getEcorePackageRef().getEModelElement();
  }

  getEAnnotations(): EList<EAnnotation> {
    return this._eAnnotations;
  }
  getEAnnotation(source: string): EAnnotation | undefined {
    return this.getEAnnotations()
      .filter((ann) => ann.getSource() === source)
      .at(0);
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 0:
        return this._eAnnotations;
      default:
        throw new Error(`EModelElement has no feature with id ${String(feature.getFeatureID())}`);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 0: {
        const list = this._eAnnotations;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EAnnotation);
        return;
      }

      default:
        throw new Error(`EModelElement has no feature with id ${String(feature.getFeatureID())}`);
    }
  }
  eBasicSetValue(feature: EStructuralFeature | number, _value: unknown): void {
    const featureId = typeof feature === 'number' ? feature : feature.getFeatureID();
    switch (featureId) {
      default:
        throw new Error(`Feature ${String(featureId)} on EModelElement is many-valued or unknown.`);
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 0:
        this._eAnnotationsCache ??= new BasicEList<EAnnotation>(this);
        return this._eAnnotationsCache;
      default:
        throw new Error(`Feature ${String(featureId)} on EModelElement is single-valued or unknown.`);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 0:
        return this._eAnnotationsCache !== undefined && this._eAnnotationsCache.size() !== 0;
      default:
        throw new Error(`EModelElement has no feature with id ${String(feature.getFeatureID())}`);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 0:
        this._eAnnotationsCache?.clear();
        return;

      default:
        throw new Error(`EModelElement has no feature with id ${String(feature.getFeatureID())}`);
    }
  }
}
