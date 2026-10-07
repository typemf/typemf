import { EObject } from './EObject.js';
import { EStructuralFeature } from './EStructuralFeature.js';

/** The kind of change a {@link Notification} reports. */
export type NotificationEventType =
  'SET' | 'UNSET' | 'ADD' | 'REMOVE' | 'ADD_MANY' | 'REMOVE_MANY' | 'MOVE' | 'RESOLVE' | 'CREATE';

/**
 * One change to one object, passed to the listeners registered with `EObject.onDidChange()`.
 *
 * What `oldValue`, `newValue` and `position` hold depends on `eventType`:
 * - `SET`, `UNSET`, `RESOLVE`: the feature's value before and after.
 * - `ADD`: `newValue` is the added element, `position` its index.
 * - `REMOVE`: `oldValue` is the removed element, `position` its former index.
 * - `MOVE`: `oldValue` is the element's former index, `newValue` the element, `position` its new
 *   index.
 */
export interface Notification {
  readonly eventType: NotificationEventType;
  /** The object that changed. */
  readonly notifier: EObject;
  /** The feature that changed; `undefined` only for `CREATE`. */
  readonly feature: EStructuralFeature | undefined;
  readonly oldValue: unknown;
  readonly newValue: unknown;
  /** The list index for `ADD`, `REMOVE` and `MOVE`; `undefined` otherwise. */
  readonly position: number | undefined;
  /** Whether the feature was set (see `EObject.eIsSet()`) before the change. */
  readonly wasSet: boolean;
}
