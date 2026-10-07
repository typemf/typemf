import type { Resource } from '../../resource/resource.js';
import { Disposable } from './Disposable.js';
import { EClass } from './EClass.js';
import { EList } from './EList.js';
import { EStructuralFeature } from './EStructuralFeature.js';
import { Notification } from './Notification.js';

/**
 * The reflective interface of every model object, generated or dynamic. Generic tooling such as
 * serializers and editors works against this interface alone.
 */
export interface EObject {
  /** The class describing this object's structure. */
  eClass(): EClass;

  /** The object containing this one through a containment reference, if any. */
  eContainer(): EObject | undefined;

  /** The containment reference of {@link eContainer} that holds this object, if any. */
  eContainingFeature(): EStructuralFeature | undefined;

  /**
   * The resource this object belongs to: the resource whose contents include it or its topmost
   * container, or `undefined` if there is none.
   */
  eResource(): Resource | undefined;

  /**
   * The direct children, across all containment references in feature order.
   *
   * @returns a new list; changing it does not change the model.
   */
  eContents(): EList<EObject>;

  /** Every object contained directly or indirectly, in depth-first pre-order. */
  eAllContents(): EObject[];

  /**
   * The current value of `feature`. A many-valued feature returns its live list; changes to that
   * list change the model.
   *
   * @throws Error if `feature` is not one of `eClass().getEAllStructuralFeatures()`.
   */
  eGet(feature: EStructuralFeature): unknown;

  /**
   * Sets `feature` to `value`. For a many-valued feature, `value` is an iterable that replaces the
   * list's contents (`undefined` or `null` clears it). Containers and opposite references are
   * updated, and listeners are notified.
   *
   * @throws Error if `feature` is not one of `eClass().getEAllStructuralFeatures()`.
   */
  eSet(feature: EStructuralFeature, value: unknown): void;

  /**
   * Whether `feature` holds a value: a single-valued feature that was set and not unset since, or
   * a many-valued feature whose list is not empty.
   *
   * @throws Error if `feature` is not one of `eClass().getEAllStructuralFeatures()`.
   */
  eIsSet(feature: EStructuralFeature): boolean;

  /**
   * Unsets `feature`: a single-valued feature returns to its default value, a many-valued feature
   * is cleared.
   *
   * @throws Error if `feature` is not one of `eClass().getEAllStructuralFeatures()`.
   */
  eUnset(feature: EStructuralFeature): void;

  /**
   * Whether this object is an unresolved proxy: a placeholder for an object in a document that
   * has not been loaded yet. Resolve it with `ResourceSet.resolve()`.
   */
  eIsProxy(): boolean;

  /**
   * An identity string `<class name>_<value>` built from the object's ID attribute. Without a set
   * ID attribute, every call returns a new generated value.
   */
  fullId(): string;

  /**
   * Registers `listener` for changes to this object, or only to `feature` if given. Listeners
   * are called synchronously, in registration order, after each change. An exception thrown by a
   * listener propagates to the code that made the change, and later listeners are not called.
   *
   * @returns a handle whose `dispose()` removes the listener.
   */
  onDidChange(listener: (notification: Notification) => void, feature?: EStructuralFeature): Disposable;

  /** Whether listeners are notified of changes; `true` by default. */
  eDeliver(): boolean;

  /**
   * Turns notification of listeners off or on, e.g. while building a large object graph.
   * Containers and opposite references are maintained either way.
   */
  eSetDeliver(deliver: boolean): void;
}
