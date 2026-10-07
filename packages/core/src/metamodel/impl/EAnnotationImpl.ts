import { BasicEList } from './BasicEList.js';
import { EModelElementImpl } from './EModelElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EAnnotation } from '../types/EAnnotation.js';
import { EClass } from '../types/EClass.js';
import { EList } from '../types/EList.js';
import { EModelElement } from '../types/EModelElement.js';
import { EObject } from '../types/EObject.js';
import { EStringToStringMapEntry } from '../types/EStringToStringMapEntry.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';

/**
 * Additional information attached to a model element: a source URI identifying the kind of
 * information, string details, and optional contained or referenced objects.
 */
export class EAnnotationImpl extends EModelElementImpl implements EAnnotation {
  private _source: string | undefined;

  private _detailsCache: BasicEList<EStringToStringMapEntry> | undefined;

  private get _details(): BasicEList<EStringToStringMapEntry> {
    this._detailsCache ??= new BasicEList<EStringToStringMapEntry>(this, getEcorePackageRef().getEAnnotation_Details());
    return this._detailsCache;
  }

  private _eModelElement: EModelElement | undefined;

  private _contentsCache: BasicEList<EObject> | undefined;

  private get _contents(): BasicEList<EObject> {
    this._contentsCache ??= new BasicEList<EObject>(this, getEcorePackageRef().getEAnnotation_Contents());
    return this._contentsCache;
  }

  private _referencesCache: BasicEList<EObject> | undefined;

  private get _references(): BasicEList<EObject> {
    this._referencesCache ??= new BasicEList<EObject>(this, getEcorePackageRef().getEAnnotation_References());
    return this._referencesCache;
  }

  eClass(): EClass {
    return getEcorePackageRef().getEAnnotation();
  }

  getSource(): string | undefined {
    return this._source;
  }
  setSource(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEAnnotation_Source(), value);
  }
  getDetails(): EList<EStringToStringMapEntry> {
    return this._details;
  }
  getEModelElement(): EModelElement | undefined {
    return this._eModelElement;
  }
  setEModelElement(value: EModelElement | undefined): void {
    this.eSet(getEcorePackageRef().getEAnnotation_EModelElement(), value);
  }
  getContents(): EList<EObject> {
    return this._contents;
  }
  getReferences(): EList<EObject> {
    return this._references;
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
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
      case 2: {
        const list = this._details;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EStringToStringMapEntry);
        return;
      }

      case 3: {
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
      case 4: {
        const list = this._contents;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EObject);
        return;
      }

      case 5: {
        const list = this._references;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EObject);
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
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 2:
        this._detailsCache ??= new BasicEList<EStringToStringMapEntry>(this);
        return this._detailsCache;
      case 4:
        this._contentsCache ??= new BasicEList<EObject>(this);
        return this._contentsCache;
      case 5:
        this._referencesCache ??= new BasicEList<EObject>(this);
        return this._referencesCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1:
        return this._source !== undefined;
      case 2:
        return this._detailsCache !== undefined && this._detailsCache.size() !== 0;
      case 3:
        return this._eModelElement !== undefined;
      case 4:
        return this._contentsCache !== undefined && this._contentsCache.size() !== 0;
      case 5:
        return this._referencesCache !== undefined && this._referencesCache.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._source;
        this._source = undefined;
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

      case 2:
        this._detailsCache?.clear();
        return;

      case 3: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eModelElement;
        this._eModelElement = undefined;
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

      case 4:
        this._contentsCache?.clear();
        return;

      case 5:
        this._referencesCache?.clear();
        return;

      default:
        super.eUnset(feature);
        return;
    }
  }
}
