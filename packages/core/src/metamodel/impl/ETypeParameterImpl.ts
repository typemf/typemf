import { EList } from '../types/EList.js';
import { BasicEList } from './BasicEList.js';
import { ETypeParameter } from '../types/ETypeParameter.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EGenericType } from '../types/EGenericType.js';
import { ENamedElementImpl } from './ENamedElementImpl.js';
import { EClass } from '../types/EClass.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';


export class ETypeParameterImpl extends ENamedElementImpl implements ETypeParameter {

  private _eBoundsCache: BasicEList<EGenericType> | undefined;

  private get _eBounds(): BasicEList<EGenericType> {
    if (!this._eBoundsCache) {
      this._eBoundsCache = new BasicEList<EGenericType>(this, getEcorePackageRef().getETypeParameter_EBounds());
    }
    return this._eBoundsCache;
  }


  eClass(): EClass {
    return getEcorePackageRef().getETypeParameter();
  }

  getEBounds(): EList<EGenericType> {
    return this._eBounds;
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 2: return this._eBounds;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 2: {
        const list = this._eBounds;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EGenericType);
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
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 2:
        if (!this._eBoundsCache) this._eBoundsCache = new BasicEList<EGenericType>(this);
        return this._eBoundsCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 2: return this._eBoundsCache !== undefined && this._eBoundsCache.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 2: this._eBoundsCache?.clear(); return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
