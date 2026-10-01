import { Disposable } from '../types/Disposable.js';
import { EClass } from '../types/EClass.js';
import { EList } from '../types/EList.js';
import { EObject } from '../types/EObject.js';
import { EReference } from '../types/EReference.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { Notification } from '../types/Notification.js';
import { BasicEList } from './BasicEList.js';

interface Listener {
  readonly callback: (notification: Notification) => void;
  readonly feature: EStructuralFeature | undefined;
}

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
  private frozen = false;

  /**
   * Marks this object (and, recursively, everything it contains) as no longer intended to be
   * mutated. Matches real EMF's own design precisely: a queryable flag, not enforced in every
   * setter. Real EMF's own enforcement is a single `assert !isFrozen()` in one place
   * (eSetDirectResource) - a mechanism that is itself frequently inactive in production Java
   * (assertions are off by default unless -ea is passed). Given that, invasively guarding every
   * setter here would be enforcing something more strictly than the system being ported actually
   * does.
   *
   * Lives here, on EObjectImpl - the one foundational file the self-hosted swap never overwrites
   * - rather than as per-class overrides on EClassImpl/EEnumImpl/EPackageImpl the way hand-written
   * core originally had it (those files are generated now). The cascade itself is generic and
   * reflective (every containment reference this object's own metaclass declares, via
   * getEAllContainments()), not a hardcoded list of "this class's own children" per subclass -
   * genuinely more complete than the old per-class version (which only ever froze the specific
   * containment features each override happened to name, missing e.g. eAnnotations), and cascades
   * transitively for free (a contained child's own freeze() call reaches its own children in
   * turn), needing no override anywhere.
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

  /** Freezes `child` if it is itself an EObjectImpl - real EMF's own conditional cascade helper. */
  private freezeChild(child: unknown): void {
    if (child instanceof EObjectImpl) child.freeze();
  }

  abstract eClass(): EClass;
  abstract eGet(feature: EStructuralFeature): unknown;
  abstract eSet(feature: EStructuralFeature, value: unknown): void;
  abstract eIsSet(feature: EStructuralFeature): boolean;
  abstract eUnset(feature: EStructuralFeature): void;

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
   * Internal - fires `notification` to every listener whose own `feature` (if any) matches this
   * one, unless eSetDeliver(false) is currently suppressing delivery. Called directly from the
   * actual mutation call sites (the eSet default dance, BasicEList.onAdded/onRemoved, eUnset,
   * and any feature's own custom setter body) - deliberately NOT derived from eDidAdd/eDidRemove,
   * since a single logical change (one eSet call) fires those twice (a remove of the old value,
   * an add of the new one), which would produce two notifications instead of the one real EMF (and
   * this project's own settled design) expects for a SET. eDidAdd/eDidRemove keep their existing,
   * unchanged responsibility (the counter bump and containment/opposite wiring); this is a
   * separate, additional call alongside them, not a replacement for them.
   */
  eNotify(notification: Notification): void {
    if (!this.deliverFlag || this.listeners.length === 0) return;
    // A snapshot, not the live array - a listener disposing itself (or another listener) mid-
    // dispatch must not skip or duplicate entries for the notification currently being delivered.
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

  /**
   * Internal - called by BasicEList (for many-valued containment features)
   * and by single-valued containment setters to update the backpointer.
   * Not part of the public EObject API.
   */
  eBasicSetContainer(container: EObject | undefined, feature: EStructuralFeature | undefined): void {
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
  /**
   * A single, global counter bumped on every eDidAdd/eDidRemove ANYWHERE in
   * the loaded model - i.e. every feature mutation, of any kind (reference
   * or attribute, many- or single-valued), on any object, not only the
   * metamodel-structural features (eStructuralFeatures/eOperations/
   * eSuperTypes/eGenericSuperTypes) a first version of this scoped the
   * bump to. That narrower scope was WRONG, found by a real, failing test:
   * a custom `get` body is free to read ANY feature (a feature computed
   * from another ordinary attribute, say - not only structural
   * relationships), so a change to that OTHER feature must ALSO invalidate
   * the cache, and a name-based allowlist can never anticipate every such
   * dependency a body might have. Bumping on every mutation is the only
   * scope that's correct for an arbitrary `get` body, not just the
   * specific eAll*-style ones that motivated this - see eclass.njk's
   * getter-caching shape, which stores the generation a cache was computed
   * at and recomputes once the current one has moved past it.
   *
   * Deliberately GLOBAL, not scoped to the specific object that changed:
   * pinpointing exactly which caches an edit could affect would need
   * either tracking each cache's real dependencies (not attempted) or a
   * reverse (subtypes) graph for the structural case specifically (this
   * project has neither). Bumping globally invalidates more than strictly
   * necessary on every edit, but never leaves anything stale - correct,
   * simple, and still a good fit for the motivating usage pattern: model
   * edits cluster at construction/load time, reads cluster at
   * serialization time, and the two rarely interleave, so in practice
   * caches stay warm for exactly the read-heavy phase this exists for.
   */
  private static modelGeneration = 0;

  static getModelGeneration(): number {
    return EObjectImpl.modelGeneration;
  }

  eDidAdd(feature: EStructuralFeature | undefined, value: unknown): void {
    EObjectImpl.modelGeneration++;
    // `feature` can genuinely be undefined here - eBootstrapList()'s lists (see EClassImpl.ts etc.)
    // are deliberately constructed with an owner but no feature, since a real feature object isn't
    // always safely resolvable this early in self-hosted bootstrap. The generation-counter bump above
    // must still happen regardless (found the hard way: a cache primed empty before eBootstrapList's
    // eSuperTypes.add() ran was never invalidated, since that add() used to never reach this method at
    // all) - only the containment/opposite logic below genuinely needs a real feature to do anything.
    if (!feature || !isReference(feature) || !(value instanceof EObjectImpl)) return;
    if (feature.isContainment()) value.eBasicMoveInto(this, feature);
    const opposite = feature.getEOpposite();
    if (opposite) value.eInverseAdd(this, opposite);
  }

  /**
   * Internal - side effects of `value` having just been removed from
   * `this.feature` (the store itself has already happened): release
   * containment and update the opposite end.
   */
  eDidRemove(feature: EStructuralFeature | undefined, value: unknown): void {
    EObjectImpl.modelGeneration++;
    if (!feature || !isReference(feature) || !(value instanceof EObjectImpl)) return;
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

  private eBasicRemoveValue(feature: EStructuralFeature, value: EObjectImpl): void {
    if (feature.isMany()) {
      this.eBasicList(feature).basicRemove(value);
    } else if (this.eGet(feature) === value) {
      this.eBasicSetValue(feature, undefined);
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
  return 'isContainment' in feature;
}

function isContainmentReference(feature: EStructuralFeature): feature is EReference {
  return isReference(feature) && feature.isContainment();
}

function isEObject(value: unknown): value is EObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as EObject).eClass === 'function'
  );
}

function isEListOfEObject(value: unknown): value is EList<EObject> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as EList<EObject>)[Symbol.iterator] === 'function'
  );
}
