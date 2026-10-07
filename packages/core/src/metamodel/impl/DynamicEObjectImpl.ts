import { EClass } from '../types/EClass.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { BasicEList } from './BasicEList.js';
import { EObjectImpl } from './EObjectImpl.js';

/**
 * A model object for any class, needing no generated code. Values are stored by the feature's ID
 * in this object's class (`EClass.getFeatureID()`), which, unlike a feature's own ID, is unique
 * even across multiple supertypes.
 */
export class DynamicEObjectImpl extends EObjectImpl {
  private readonly values = new Map<number, unknown>();

  constructor(private readonly dynamicEClass: EClass) {
    super();
    for (const feature of dynamicEClass.getEAllStructuralFeatures()) {
      if (feature.isMany()) {
        this.values.set(this.dynamicEClass.getFeatureID(feature), new BasicEList(this, feature));
      }
    }
  }

  eClass(): EClass {
    return this.dynamicEClass;
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
    return this.values.get(this.dynamicEClass.getFeatureID(feature));
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
    const id = this.dynamicEClass.getFeatureID(feature);

    if (feature.isMany()) {
      const list = this.requireList(feature);
      // Snapshot first: `value` may be this very list (eSet(f, eGet(f))).
      const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
      list.clear();
      for (const item of items) list.add(item);
      return;
    }

    const oldValue = this.values.get(id);
    if (oldValue === value) return;
    const wasSet = this.eIsSet(feature);
    this.values.set(id, value);
    this.eDidRemove(feature, oldValue);
    this.eDidAdd(feature, value);
    this.eNotify({ eventType: 'SET', notifier: this, feature, oldValue, newValue: value, position: undefined, wasSet });
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    const id = this.dynamicEClass.getFeatureID(feature);
    if (feature.isMany()) {
      return (this.values.get(id) as BasicEList<unknown> | undefined)?.size() !== 0;
    }
    return this.values.has(id) && this.values.get(id) !== undefined;
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    const id = this.dynamicEClass.getFeatureID(feature);
    if (feature.isMany()) {
      this.requireList(feature).clear();
      return;
    }
    const wasSet = this.eIsSet(feature);
    const oldValue = this.values.get(id);
    this.values.delete(id);
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
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    const id = this.dynamicEClass.getFeatureID(feature);
    if (value === undefined) {
      this.values.delete(id);
    } else {
      this.values.set(id, value);
    }
  }

  private requireList(feature: EStructuralFeature): BasicEList<unknown> {
    const list = this.values.get(this.dynamicEClass.getFeatureID(feature));
    if (!(list instanceof BasicEList)) {
      throw new Error(
        `Feature '${feature.getName()}' is many-valued but has no backing EList - this DynamicEObjectImpl may have been constructed against a stale EClass (its structural features changed after construction).`
      );
    }
    return list;
  }
}
