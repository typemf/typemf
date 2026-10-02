import { EObject, isEReference, Notification } from '@typemf/core';
import { encodeAttributeValue } from '@typemf/json';
import { ApplyEditRequest, WireValue } from './host-message-protocol.js';
import { WebviewObjectRegistry } from './webview-object-registry.js';

function encodeWireValue(
  value: unknown,
  feature: Notification['feature'],
  registry: WebviewObjectRegistry
): WireValue | undefined {
  if (value === undefined) return undefined;
  if (feature && isEReference(feature)) {
    const id = registry.hostIdFor(value as EObject);
    // Should not normally happen for a real edit on a genuinely reconstructed object - but if it
    // does (e.g. a value the webview created locally, never itself sent by the host), there is
    // nothing meaningful to reference on the host side, so the whole notification is dropped
    // (see relayNotification's own undefined-return handling), not sent with a broken reference.
    return id === undefined ? undefined : { ref: id };
  }
  return { primitive: encodeAttributeValue(value, feature!) };
}

/**
 * Translates one already-happened local Notification into the ApplyEditRequest asking the host
 * to replay the equivalent change on the real object - or undefined if it can't or shouldn't be
 * relayed at all (an event type this project never actually fires, a notifier/feature this
 * registry has no host id for, or a reference value with nothing to reference on the host side).
 *
 * `requestId` is the caller's own to mint (see host-message-uri-converter.ts's own
 * request/response correlation pattern - the same shape reused here for edits, not a new one).
 */
/**
 * A relayNotification outcome that isn't a real ApplyEditRequest: either a genuinely expected,
 * silent no-op (an event type this project's own eNotify call sites never fire), or a real
 * problem worth surfacing (the edit happened locally but there is nothing to tell the host to
 * apply it to/with, or no way to encode the value at all) - see RelayFailure's own reason field
 * for which. Kept as a distinct return shape from `undefined`-meaning-only-"skip silently", so
 * the caller (EditRelay.send) can tell the two apart and only surface the latter.
 */
export interface RelayFailure {
  reason: string;
}

export function relayNotification(
  notification: Notification,
  registry: WebviewObjectRegistry,
  requestId: string
): ApplyEditRequest | RelayFailure | undefined {
  if (
    notification.eventType !== 'SET' &&
    notification.eventType !== 'UNSET' &&
    notification.eventType !== 'ADD' &&
    notification.eventType !== 'REMOVE'
  ) {
    return undefined; // not one of the four event types this project's own eNotify call sites ever fire
  }

  const objectId = registry.hostIdFor(notification.notifier);
  const featureId = notification.feature ? registry.hostIdFor(notification.feature) : undefined;
  if (!objectId || !featureId) {
    return {
      reason: `Could not relay an edit: this editor has no host-side id for the edited object or its feature (feature '${notification.feature?.getName() ?? '(unknown)'}'). The change was applied locally but not sent to the real document.`,
    };
  }

  // REMOVE identifies WHAT to remove via the removed value (oldValue) itself, not position - more
  // robust than a positional index, which could have drifted if another edit happened concurrently
  // between this notification firing and the host actually applying it.
  const rawValue = notification.eventType === 'REMOVE' ? notification.oldValue : notification.newValue;
  const value =
    notification.eventType === 'UNSET' ? undefined : encodeWireValue(rawValue, notification.feature, registry);
  if (notification.eventType !== 'UNSET' && value === undefined) {
    return {
      reason: `Could not relay an edit to feature '${notification.feature?.getName() ?? '(unknown)'}': its new value could not be encoded. The change was applied locally but not sent to the real document.`,
    };
  }

  return {
    type: 'typemf/applyEdit',
    requestId,
    objectId,
    featureId,
    eventType: notification.eventType,
    value,
    position: notification.position,
  };
}
