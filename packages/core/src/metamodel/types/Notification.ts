import { EObject } from './EObject.js';
import { EStructuralFeature } from './EStructuralFeature.js';

/**
 * Real EMF's Notification.getEventType() constants, minus REMOVING_ADAPTER (meaningless here -
 * there is no ported Adapter interface, see EObject.onDidChange's own doc comment) and minus
 * isTouch()/isReset()'s implied "no-op" event shapes (out of scope for now - not needed by either
 * motivating use case, undo/redo or the instance editor's webview relay).
 */
export type NotificationEventType =
  'SET' | 'UNSET' | 'ADD' | 'REMOVE' | 'ADD_MANY' | 'REMOVE_MANY' | 'MOVE' | 'RESOLVE' | 'CREATE';

/**
 * A single, already-happened change to one EObject - real EMF's Notification, adapted: plain
 * readonly properties rather than getEventType()/getOldValue()/etc. methods. Unlike EObject/
 * EClass/EStructuralFeature (the reflective metamodel types, method-based throughout to match
 * real EMF's own convention), a Notification isn't itself a reflective object - it's a plain,
 * immutable event record, closer in spirit to VS Code's own event objects (e.g.
 * TextDocumentChangeEvent) than to this project's metamodel types.
 */
export interface Notification {
  readonly eventType: NotificationEventType;
  /** The object this change happened on - always the object onDidChange() was called on. */
  readonly notifier: EObject;
  /** Undefined only for CREATE (an object that doesn't have a "this changed" feature of its own). */
  readonly feature: EStructuralFeature | undefined;
  readonly oldValue: unknown;
  readonly newValue: unknown;
  /** Index within a many-valued feature - undefined for anything single-valued. */
  readonly position: number | undefined;
  /** Whether feature was eIsSet() before this change - most relevant for reversing an UNSET. */
  readonly wasSet: boolean;
}
