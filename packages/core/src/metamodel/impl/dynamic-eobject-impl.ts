import { EClass } from '../api/eclass.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { BasicEList } from './basic-elist.js';
import { EObjectImpl } from './eobject-impl.js';

/**
 * Generic, map-backed EObject that works for any EClass with no generated
 * code at all - the "dynamic instantiation" path discussed for models
 * parsed straight from a .ecore file. Values are keyed by featureID rather
 * than by named fields, unlike a generated *Gen class.
 *
 * Containment and opposite maintenance (eDidAdd/eDidRemove, eInverseAdd/
 * eInverseRemove) come for free from EObjectImpl, since those are generic
 * there and only call back into eGet/eBasicSetValue.
 */
export class DynamicEObjectImpl extends EObjectImpl {
  private readonly values = new Map<number, unknown>();

  constructor(private readonly dynamicEClass: EClass) {
    super();
    for (const feature of dynamicEClass.getEAllStructuralFeatures()) {
      if (feature.isMany()) {
        this.values.set(feature.getFeatureID(), new BasicEList(this, feature));
      }
    }
  }

  eClass(): EClass {
    return this.dynamicEClass;
  }

  eGet(feature: EStructuralFeature): unknown {
    return this.values.get(feature.getFeatureID());
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    const id = feature.getFeatureID();

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
    this.values.set(id, value);
    this.eDidRemove(feature, oldValue);
    this.eDidAdd(feature, value);
  }

  eIsSet(feature: EStructuralFeature): boolean {
    const id = feature.getFeatureID();
    if (feature.isMany()) {
      return (this.values.get(id) as BasicEList<unknown> | undefined)?.size() !== 0;
    }
    return this.values.has(id) && this.values.get(id) !== undefined;
  }

  eUnset(feature: EStructuralFeature): void {
    const id = feature.getFeatureID();
    if (feature.isMany()) {
      this.requireList(feature).clear();
      return;
    }
    const oldValue = this.values.get(id);
    this.values.delete(id);
    this.eDidRemove(feature, oldValue);
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    if (value === undefined) {
      this.values.delete(feature.getFeatureID());
    } else {
      this.values.set(feature.getFeatureID(), value);
    }
  }

  private requireList(feature: EStructuralFeature): BasicEList<unknown> {
    const list = this.values.get(feature.getFeatureID());
    if (!(list instanceof BasicEList)) {
      throw new Error(
        `Feature '${feature.getName()}' is many-valued but has no backing EList - this DynamicEObjectImpl may have been constructed against a stale EClass (its structural features changed after construction).`
      );
    }
    return list;
  }
}
