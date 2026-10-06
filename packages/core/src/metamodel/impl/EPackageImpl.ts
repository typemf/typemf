import { BasicEList } from './BasicEList.js';
import { ENamedElementImpl } from './ENamedElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EClassifier } from '../types/EClassifier.js';
import { EFactory } from '../types/EFactory.js';
import { EList } from '../types/EList.js';
import { EPackage } from '../types/EPackage.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';

export class EPackageImpl extends ENamedElementImpl implements EPackage {
  private _nsURI: string | undefined;

  private _nsPrefix: string | undefined;

  private _eFactoryInstance: EFactory | undefined;

  private _eClassifiersCache: BasicEList<EClassifier> | undefined;

  private get _eClassifiers(): BasicEList<EClassifier> {
    this._eClassifiersCache ??= new BasicEList<EClassifier>(this, getEcorePackageRef().getEPackage_EClassifiers());
    return this._eClassifiersCache;
  }

  private _eSubpackagesCache: BasicEList<EPackage> | undefined;

  private get _eSubpackages(): BasicEList<EPackage> {
    this._eSubpackagesCache ??= new BasicEList<EPackage>(this, getEcorePackageRef().getEPackage_ESubpackages());
    return this._eSubpackagesCache;
  }

  private _eSuperPackage: EPackage | undefined;

  eClass(): EClass {
    return getEcorePackageRef().getEPackage();
  }

  getNsURI(): string | undefined {
    return this._nsURI;
  }
  setNsURI(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEPackage_NsURI(), value);
  }
  getNsPrefix(): string | undefined {
    return this._nsPrefix;
  }
  setNsPrefix(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEPackage_NsPrefix(), value);
  }
  getEFactoryInstance(): EFactory | undefined {
    return this._eFactoryInstance;
  }
  setEFactoryInstance(value: EFactory | undefined): void {
    this.eSet(getEcorePackageRef().getEPackage_EFactoryInstance(), value);
  }
  getEClassifiers(): EList<EClassifier> {
    return this._eClassifiers;
  }
  getESubpackages(): EList<EPackage> {
    return this._eSubpackages;
  }
  getESuperPackage(): EPackage | undefined {
    return this._eSuperPackage;
  }

  setESuperPackage(value: EPackage | undefined): void {
    this._eSuperPackage = value;
  }
  getEClassifier(name: string): EClassifier | undefined {
    return this.getEClassifiers()
      .filter((cl) => cl.getName() === name)
      .at(0);
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2:
        return this._nsURI;
      case 3:
        return this._nsPrefix;
      case 4:
        return this._eFactoryInstance;
      case 5:
        return this._eClassifiers;
      case 6:
        return this._eSubpackages;
      case 7:
        return this._eSuperPackage;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2: {
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
      case 5: {
        const list = this._eClassifiers;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EClassifier);
        return;
      }

      case 6: {
        const list = this._eSubpackages;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EPackage);
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
      case 2:
        this._nsURI = value as string | undefined;
        return;
      case 3:
        this._nsPrefix = value as string | undefined;
        return;
      case 4:
        this._eFactoryInstance = value as EFactory | undefined;
        return;
      case 7:
        this._eSuperPackage = value as EPackage | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 5:
        this._eClassifiersCache ??= new BasicEList<EClassifier>(this);
        return this._eClassifiersCache;
      case 6:
        this._eSubpackagesCache ??= new BasicEList<EPackage>(this);
        return this._eSubpackagesCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2:
        return this._nsURI !== undefined;
      case 3:
        return this._nsPrefix !== undefined;
      case 4:
        return this._eFactoryInstance !== undefined;
      case 5:
        return this._eClassifiersCache !== undefined && this._eClassifiersCache.size() !== 0;
      case 6:
        return this._eSubpackagesCache !== undefined && this._eSubpackagesCache.size() !== 0;
      case 7:
        return this._eSuperPackage !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._nsURI;
        this._nsURI = undefined;
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

      case 3: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._nsPrefix;
        this._nsPrefix = undefined;
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

      case 4: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eFactoryInstance;
        this._eFactoryInstance = undefined;
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

      case 5:
        this._eClassifiersCache?.clear();
        return;

      case 6:
        this._eSubpackagesCache?.clear();
        return;

      case 7: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._eSuperPackage;
        this._eSuperPackage = undefined;
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

      default:
        super.eUnset(feature);
        return;
    }
  }
}
