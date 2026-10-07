import type { Resource } from '../../resource/resource.js';
import { Disposable } from '../types/Disposable.js';
import { EClass } from '../types/EClass.js';
import { EList } from '../types/EList.js';
import { EObject } from '../types/EObject.js';
import { EReference } from '../types/EReference.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { Notification } from '../types/Notification.js';
import { BasicEList } from './BasicEList.js';
import { UnmodifiableEList } from './UnmodifiableEList.js';

interface Listener {
  readonly callback: (notification: Notification) => void;
  readonly feature: EStructuralFeature | undefined;
}

let fallbackIdCounter = 0;

/** The topmost container of `obj`, or `obj` itself. */
function findRoot(obj: EObject): EObject {
  let current = obj;
  let container = current.eContainer();
  while (container) {
    current = container;
    container = current.eContainer();
  }
  return current;
}

/**
 * Base class of every model object, generated or dynamic. Subclasses implement storage
 * (eGet/eSet/eIsSet/eUnset/eBasicSetValue); containment, opposite references, notification and
 * the containment tree accessors are implemented here on top of it.
 */
export abstract class EObjectImpl implements EObject {
  private _eContainer: EObject | undefined;
  private _eContainingFeature: EStructuralFeature | undefined;
  private _eProxy = false;
  private frozen = false;
  /** Set only on a root of a resource's contents; other objects find their resource via their root. */
  private _eDirectResource: Resource | undefined;

  /**
   * Marks this object and everything it contains as not to be changed. Like EMF, this is only a
   * flag that can be queried; setters do not check it.
   */
  freeze(): void {
    for (const feature of this.eClass().getEAllContainments()) {
      const value = this.eGet(feature);
      if (feature.isMany()) {
        for (const child of value as Iterable<unknown>) this.freezeChild(child);
      } else {
        this.freezeChild(value);
      }
    }
    this.frozen = true;
  }

  isFrozen(): boolean {
    return this.frozen;
  }

  private freezeChild(child: unknown): void {
    if (child instanceof EObjectImpl) child.freeze();
  }

  abstract eClass(): EClass;
  abstract eGet(feature: EStructuralFeature): unknown;
  abstract eSet(feature: EStructuralFeature, value: unknown): void;
  abstract eIsSet(feature: EStructuralFeature): boolean;
  abstract eUnset(feature: EStructuralFeature): void;

  /**
   * Throws unless `feature` belongs to this object's class. Feature IDs are only unique within a
   * class, so dispatching on the ID alone would silently access another feature for a feature of an
   * unrelated class.
   */
  protected requireOwnFeature(feature: EStructuralFeature): void {
    if (!this.eClass().getEAllStructuralFeatures().contains(feature)) {
      throw new Error(`The feature '${feature.getName()}' is not a valid feature`);
    }
  }

  private listeners: Listener[] = [];
  private deliverFlag = true;

  onDidChange(callback: (notification: Notification) => void, feature?: EStructuralFeature): Disposable {
    const entry: Listener = { callback, feature };
    this.listeners.push(entry);
    return {
      dispose: () => {
        const index = this.listeners.indexOf(entry);
        if (index !== -1) this.listeners.splice(index, 1);
      },
    };
  }

  eDeliver(): boolean {
    return this.deliverFlag;
  }

  eSetDeliver(deliver: boolean): void {
    this.deliverFlag = deliver;
  }

  /**
   * Passes `notification` to the listeners registered for its feature or for all
   * features, unless delivery is turned off. Called by generated code once per change, not by
   * eDidAdd/eDidRemove: a single SET calls both of those.
   */
  eNotify(notification: Notification): void {
    if (!this.deliverFlag || this.listeners.length === 0) return;
    // Iterates a copy, so a listener may dispose itself or others during delivery.
    for (const entry of [...this.listeners]) {
      if (entry.feature && entry.feature !== notification.feature) continue;
      entry.callback(notification);
    }
  }

  eContainer(): EObject | undefined {
    return this._eContainer;
  }

  eContainingFeature(): EStructuralFeature | undefined {
    return this._eContainingFeature;
  }

  eResource(): Resource | undefined {
    return (findRoot(this) as EObjectImpl)._eDirectResource;
  }

  /** @internal Records the resource of a root; called by a resource's contents list. */
  eSetDirectResource(resource: Resource | undefined): void {
    this._eDirectResource = resource;
  }

  /** @internal Sets the container back-pointer, without touching the container's feature. */
  eBasicSetContainer(container: EObject | undefined, feature: EStructuralFeature | undefined): void {
    this._eContainer = container;
    this._eContainingFeature = feature;
  }

  /**
   * Stores the value of a single-valued feature without containment, opposite or notification side
   * effects; `undefined` means unset. Implemented by generated code.
   */
  abstract eBasicSetValue(feature: EStructuralFeature, value: unknown): void;

  /**
   * Incremented on every change to any feature of any object. A computed feature caches its value
   * together with the generation it was computed at, and recomputes once the generation moved on:
   * its getter may read any feature, so every change invalidates every cache. Changes and reads
   * mostly happen in separate phases (loading, then saving or displaying), so caches stay valid
   * where it matters.
   */
  private static modelGeneration = 0;

  /** The current model generation (see `modelGeneration`); read by generated caching code. */
  static getModelGeneration(): number {
    return EObjectImpl.modelGeneration;
  }

  /**
   * Side effects of `value` having been stored into `feature` (the store has already happened):
   * takes ownership for a containment and updates the opposite reference. Called by generated
   * code.
   */
  eDidAdd(feature: EStructuralFeature | undefined, value: unknown): void {
    EObjectImpl.modelGeneration++;
    // Lists built during bootstrap have no feature yet; the counter above still has to move.
    if (!feature || !isReference(feature) || !(value instanceof EObjectImpl)) return;
    if (feature.isContainment()) value.eBasicMoveInto(this, feature);
    const opposite = feature.getEOpposite();
    if (opposite) value.eInverseAdd(this, opposite);
  }

  /**
   * Side effects of `value` having been removed from `feature` (the removal has already happened):
   * releases containment and updates the opposite reference. Called by generated code.
   */
  eDidRemove(feature: EStructuralFeature | undefined, value: unknown): void {
    EObjectImpl.modelGeneration++;
    if (!feature || !isReference(feature) || !(value instanceof EObjectImpl)) return;
    if (feature.isContainment()) value.eBasicReleaseFrom(this, feature);
    const opposite = feature.getEOpposite();
    if (opposite) value.eInverseRemove(this, opposite);
  }

  /**
   * @internal `otherEnd` now references this object through the opposite of `feature`; makes
   * `feature` reference `otherEnd` too. A single-valued `feature` drops its previous value, whose
   * own opposite is cleared in turn.
   */
  eInverseAdd(otherEnd: EObjectImpl, feature: EReference): void {
    // This object may be an unresolved proxy; its storage works normally, and the opposite is
    // known from the referencing side anyway.
    if (feature.isMany()) {
      const list = this.eBasicList(feature);
      const sizeBefore = list.size();
      list.basicAdd(otherEnd);
      // Unchanged if otherEnd was already in the list.
      if (list.size() > sizeBefore) {
        this.eNotify({
          eventType: 'ADD',
          notifier: this,
          feature,
          oldValue: undefined,
          newValue: otherEnd,
          position: list.size() - 1,
          wasSet: true,
        });
      }
    } else {
      const oldValue = this.eGet(feature);
      if (oldValue === otherEnd) return;
      const wasSet = this.eIsSet(feature);
      this.eBasicSetValue(feature, otherEnd);
      this.eDidRemove(feature, oldValue);
      this.eNotify({
        eventType: 'SET',
        notifier: this,
        feature,
        oldValue,
        newValue: otherEnd,
        position: undefined,
        wasSet,
      });
    }
    if (feature.isContainment()) otherEnd.eBasicMoveInto(this, feature);
  }

  /**
   * @internal `otherEnd` no longer references this object through the opposite of `feature`;
   * removes `otherEnd` from `feature`.
   */
  eInverseRemove(otherEnd: EObjectImpl, feature: EReference): void {
    this.eBasicRemoveValue(feature, otherEnd);
    if (feature.isContainment()) otherEnd.eBasicReleaseFrom(this, feature);
  }

  /**
   * Makes `feature` of `container` the only owner of this object, first removing it from its
   * previous container, so an object is never in two containment features at once.
   */
  private eBasicMoveInto(container: EObjectImpl, feature: EReference): void {
    const oldContainer = this._eContainer;
    const oldFeature = this._eContainingFeature;
    if (oldContainer === container && oldFeature === feature) return;
    if (oldContainer instanceof EObjectImpl && oldFeature && isReference(oldFeature)) {
      oldContainer.eBasicRemoveValue(oldFeature, this);
      const oldOpposite = oldFeature.getEOpposite();
      if (oldOpposite) this.eBasicRemoveValue(oldOpposite, oldContainer);
    }
    this.eBasicSetContainer(container, feature);
  }

  private eBasicReleaseFrom(container: EObjectImpl, feature: EReference): void {
    if (this._eContainer === container && this._eContainingFeature === feature) {
      this.eBasicSetContainer(undefined, undefined);
    }
  }

  /**
   * @internal Removes this object from its container without adding it anywhere; used when it
   * becomes a root of a resource.
   */
  eBasicDetachFromContainer(): void {
    const oldContainer = this._eContainer;
    const oldFeature = this._eContainingFeature;
    if (oldContainer instanceof EObjectImpl && oldFeature && isReference(oldFeature)) {
      oldContainer.eBasicRemoveValue(oldFeature, this);
      const oldOpposite = oldFeature.getEOpposite();
      if (oldOpposite) this.eBasicRemoveValue(oldOpposite, oldContainer);
    }
    this.eBasicSetContainer(undefined, undefined);
  }

  /**
   * Removes `value` from `feature` and notifies listeners, without containment or opposite side
   * effects: used for the other end of a change whose side effects are already being handled.
   */
  private eBasicRemoveValue(feature: EStructuralFeature, value: EObjectImpl): void {
    if (feature.isMany()) {
      const list = this.eBasicList(feature);
      const position = list.indexOf(value);
      if (list.basicRemove(value)) {
        this.eNotify({
          eventType: 'REMOVE',
          notifier: this,
          feature,
          oldValue: value,
          newValue: undefined,
          position,
          wasSet: true,
        });
      }
    } else if (this.eGet(feature) === value) {
      const wasSet = this.eIsSet(feature);
      this.eBasicSetValue(feature, undefined);
      this.eNotify({
        eventType: 'SET',
        notifier: this,
        feature,
        oldValue: value,
        newValue: undefined,
        position: undefined,
        wasSet,
      });
    }
  }

  private eBasicList(feature: EStructuralFeature): BasicEList<unknown> {
    const list = this.eGet(feature);
    if (!(list instanceof BasicEList)) {
      throw new Error(`Feature '${feature.getName()}' is many-valued but has no backing BasicEList.`);
    }
    return list;
  }

  eContents(): EList<EObject> {
    const result: EObject[] = [];
    for (const feature of this.eClass().getEAllStructuralFeatures()) {
      if (!isContainmentReference(feature)) continue;
      const value = this.eGet(feature);
      if (feature.isMany()) {
        if (isEListOfEObject(value)) result.push(...value);
      } else if (isEObject(value)) {
        result.push(value);
      }
    }
    return new UnmodifiableEList(result);
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
    return this._eProxy;
  }

  /** @internal Marks this object as a proxy; called by `createProxy()`. */
  eSetProxy(flag: boolean): void {
    this._eProxy = flag;
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
  return 'isContainment' in feature;
}

function isContainmentReference(feature: EStructuralFeature): feature is EReference {
  return isReference(feature) && feature.isContainment();
}

function isEObject(value: unknown): value is EObject {
  return typeof value === 'object' && value !== null && typeof (value as EObject).eClass === 'function';
}

function isEListOfEObject(value: unknown): value is EList<EObject> {
  return (
    typeof value === 'object' && value !== null && typeof (value as EList<EObject>)[Symbol.iterator] === 'function'
  );
}
