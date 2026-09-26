import {
  EClass,
  EList,
  EObject,
  EReference,
  EStructuralFeature,
} from "../../index.js";
import { BasicEList } from "./index.js";

let fallbackIdCounter = 0;

/**
 * Abstract base for every model instance. eContainer/eContents/eAllContents
 * are fully generic here - they are derived entirely from eGet(), which is
 * why subclasses only need to implement eGet/eSet/eIsSet/eUnset/eClass to
 * get correct containment behaviour for free. This is the same shape used
 * by generated *Gen classes and by DynamicEObjectImpl.
 */
export abstract class EObjectImpl implements EObject {
  private _eContainer: EObject | undefined;
  private _eContainingFeature: EStructuralFeature | undefined;

  abstract eClass(): EClass;
  abstract eGet(feature: EStructuralFeature): unknown;
  abstract eSet(feature: EStructuralFeature, value: unknown): void;
  abstract eIsSet(feature: EStructuralFeature): boolean;
  abstract eUnset(feature: EStructuralFeature): void;

  eContainer(): EObject | undefined {
    return this._eContainer;
  }

  eContainingFeature(): EStructuralFeature | undefined {
    return this._eContainingFeature;
  }

  /**
   * Internal - called by BasicEList (for many-valued containment features)
   * and by single-valued containment setters to update the backpointer.
   * Not part of the public EObject API.
   */
  eBasicSetContainer(
    container: EObject | undefined,
    feature: EStructuralFeature | undefined,
  ): void {
    this._eContainer = container;
    this._eContainingFeature = feature;
  }

  /**
   * Internal - raw store for a single-valued feature, with no containment
   * or opposite side effects. `undefined` means unset. This is the only
   * storage primitive the generic bookkeeping below needs from a subclass;
   * many-valued features are reached through eGet() and BasicEList.basicAdd/
   * basicRemove instead.
   */
  abstract eBasicSetValue(feature: EStructuralFeature, value: unknown): void;

  /**
   * Internal - side effects of `value` having just been stored into
   * `this.feature` (the store itself has already happened): take ownership
   * if `feature` is a containment, and update the opposite end if it has
   * one. Called by BasicEList and by single-valued setters.
   */
  eDidAdd(feature: EStructuralFeature, value: unknown): void {
    if (!isReference(feature) || !(value instanceof EObjectImpl)) return;
    if (isReference(feature) && feature.isContainment())
      value.eBasicMoveInto(this, feature);
    const opposite = feature.getEOpposite();
    if (opposite) value.eInverseAdd(this, opposite);
  }

  /**
   * Internal - side effects of `value` having just been removed from
   * `this.feature` (the store itself has already happened): release
   * containment and update the opposite end.
   */
  eDidRemove(feature: EStructuralFeature, value: unknown): void {
    if (!isReference(feature) || !(value instanceof EObjectImpl)) return;
    if (feature.isContainment()) value.eBasicReleaseFrom(this, feature);
    const opposite = feature.getEOpposite();
    if (opposite) value.eInverseRemove(this, opposite);
  }

  /**
   * Internal - `otherEnd` just started referencing `this` through
   * `feature.getEOpposite()`; make `this.feature` point back at `otherEnd`.
   * For a single-valued `feature` this displaces the previous value, whose
   * own opposite (still pointing at `this`) is cleared in turn.
   */
  eInverseAdd(otherEnd: EObjectImpl, feature: EReference): void {
    if (feature.isMany()) {
      this.eBasicList(feature).basicAdd(otherEnd);
    } else {
      const oldValue = this.eGet(feature);
      if (oldValue === otherEnd) return;
      this.eBasicSetValue(feature, otherEnd);
      this.eDidRemove(feature, oldValue);
    }
    if (feature.isContainment()) otherEnd.eBasicMoveInto(this, feature);
  }

  /**
   * Internal - `otherEnd` just stopped referencing `this` through
   * `feature.getEOpposite()`; remove `otherEnd` from `this.feature`.
   */
  eInverseRemove(otherEnd: EObjectImpl, feature: EReference): void {
    this.eBasicRemoveValue(feature, otherEnd);
    if (feature.isContainment()) otherEnd.eBasicReleaseFrom(this, feature);
  }

  /**
   * Makes `container.feature` the sole owner of `this`. If `this` was
   * contained elsewhere, it is removed from the old containing feature
   * (and that feature's opposite on `this` is cleared) first, so an object
   * is never a member of two containment lists at once.
   */
  private eBasicMoveInto(container: EObjectImpl, feature: EReference): void {
    const oldContainer = this._eContainer;
    const oldFeature = this._eContainingFeature;
    if (oldContainer === container && oldFeature === feature) return;
    if (
      oldContainer instanceof EObjectImpl &&
      oldFeature &&
      isReference(oldFeature)
    ) {
      oldContainer.eBasicRemoveValue(oldFeature, this);
      const oldOpposite = oldFeature.getEOpposite();
      if (oldOpposite) this.eBasicRemoveValue(oldOpposite, oldContainer);
    }
    this.eBasicSetContainer(container, feature);
  }

  private eBasicReleaseFrom(container: EObjectImpl, feature: EReference): void {
    if (
      this._eContainer === container &&
      this._eContainingFeature === feature
    ) {
      this.eBasicSetContainer(undefined, undefined);
    }
  }

  private eBasicRemoveValue(
    feature: EStructuralFeature,
    value: EObjectImpl,
  ): void {
    if (feature.isMany()) {
      this.eBasicList(feature).basicRemove(value);
    } else if (this.eGet(feature) === value) {
      this.eBasicSetValue(feature, undefined);
    }
  }

  private eBasicList(feature: EStructuralFeature): BasicEList<unknown> {
    const list = this.eGet(feature);
    if (!(list instanceof BasicEList)) {
      throw new Error(
        `Feature '${feature.getName()}' is many-valued but has no backing BasicEList.`,
      );
    }
    return list;
  }

  eContents(): EList<EObject> {
    const result = new BasicEList<EObject>();
    for (const feature of this.eClass().getEAllStructuralFeatures()) {
      if (!isContainmentReference(feature)) continue;
      const value = this.eGet(feature);
      if (feature.isMany()) {
        if (isEListOfEObject(value)) {
          for (const child of value) result.add(child);
        }
      } else if (isEObject(value)) {
        result.add(value);
      }
    }
    return result;
  }

  eAllContents(): EObject[] {
    const result: EObject[] = [];
    for (const child of this.eContents()) {
      result.push(child);
      result.push(...child.eAllContents());
    }
    return result;
  }

  eIsProxy(): boolean {
    return false;
  }

  fullId(): string {
    const className = this.eClass().getName();
    const idAttribute = this.eClass()
      .getEAllAttributes()
      .find((attr) => attr.isID());
    if (idAttribute && this.eIsSet(idAttribute)) {
      return `${className}_${String(this.eGet(idAttribute))}`;
    }
    return `${className}_${(fallbackIdCounter++).toString(36)}`;
  }
}

function isReference(feature: EStructuralFeature): feature is EReference {
  return "isContainment" in feature;
}

function isContainmentReference(
  feature: EStructuralFeature,
): feature is EReference {
  return isReference(feature) && feature.isContainment();
}

function isEObject(value: unknown): value is EObject {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as EObject).eClass === "function"
  );
}

function isEListOfEObject(value: unknown): value is EList<EObject> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as EList<EObject>)[Symbol.iterator] === "function"
  );
}
