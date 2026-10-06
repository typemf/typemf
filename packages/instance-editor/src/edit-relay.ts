import { Disposable, EObject, Notification } from '@typemf/core';
import {
  CreateChildRequest,
  EditRelayFailedMessage,
  isApplyEditError,
  isApplyEditResponse,
  isCreateChildError,
  isCreateChildResponse,
} from './host-message-protocol.js';
import { PostMessageTransport } from './host-message-uri-converter.js';
import { relayNotification } from './relay-notification.js';
import { WebviewObjectRegistry } from './webview-object-registry.js';

/**
 * The write-path counterpart to HostMessageUriConverter - kept as its own, separate class rather
 * than folded into that one, even though both share the same request/response-over-postMessage
 * pattern: that one implements UriConverter (reads only), this one has a different, additive
 * responsibility (writes), matching this package's own one-class-per-concern discipline
 * throughout.
 *
 * attachTo is literally the mechanism the whole write-path design was built around: catching
 * every eSet/eUnset/list mutation transparently via the real EObject.onDidChange (see this
 * session's own Notification/Adapter work) rather than requiring every piece of UI code that
 * edits something to separately remember to notify the host itself.
 */
export class EditRelay {
  private readonly pending = new Map<string, { resolve: () => void; reject: (err: Error) => void }>();
  private readonly pendingChildCreation = new Map<
    string,
    { resolve: (childId: string) => void; reject: (err: Error) => void }
  >();
  private nextRequestId = 1;
  /**
   * One-shot, per-object suppression for "add child": after the host has already created and
   * added a child (via createChild, below), the webview still needs its own, already-displayed
   * local parent object updated in place - the same JS object instance the tree/properties panel
   * already hold a reference to, not a fresh reconstruction that would break React's own identity
   * - so the UI code that awaited createChild() does a normal, local list.add()/eSet() on that
   * real parent object itself, firing onDidChange normally (useObjectVersion still sees it,
   * re-rendering correctly). Relaying THAT notification back to the host would be redundant (and
   * wrong - the host's own copy is already ahead, not behind): callers mark the parent here,
   * immediately before that local mutation, and attachTo's own listener checks and clears it
   * before deciding whether to relay - a one-shot flag, not a standing suppression, so every
   * other, later, genuine edit to the same object still relays normally.
   */
  private readonly suppressed = new Set<EObject>();
  /**
   * Blanket, reentrant suppression for the whole reconstruction of a snapshot graph - not just
   * the object SnapshotSerializer.deserialize() is currently populating (attachTo's own "wire
   * only once this object is fully populated" already covers that), but every OTHER object this
   * same reconstruction touches too. A real, confirmed gap found running this: adding a freshly-
   * reconstructed child to its freshly-reconstructed parent's containment list (e.g. bookClass's
   * `eStructuralFeatures`) fires the matching opposite update on the CHILD (titleAttr's own
   * `eContainingClass`, CORE-09's own fix) - and that child's attachTo was already wired, finishing
   * before the parent's own list.add() call runs, since it's resolved as the parent's own
   * reference first. Without this, that opposite update - pure reconstruction bookkeeping, not a
   * real edit - gets relayed to the host as if it were one. A counter, not a flag: deserialize()
   * calls nest (resolving one object's reference can trigger another resource's own deserialize()
   * recursively), so suppression must stay active for the whole, possibly-nested span, not drop
   * to false the instant the innermost call returns.
   */
  private suppressingReconstruction = 0;

  constructor(private readonly transport: PostMessageTransport) {}

  /**
   * Runs `fn` (SnapshotSerializer's own deserialize(), reconstructing one object and everything
   * it eagerly needs) with every notification on every object suppressed for the duration - see
   * suppressingReconstruction's own reasoning for why this has to be blanket, not per-object.
   */
  async suppressDuringReconstruction<T>(fn: () => Promise<T>): Promise<T> {
    this.suppressingReconstruction++;
    try {
      return await fn();
    } finally {
      this.suppressingReconstruction--;
    }
  }

  suppressNext(obj: EObject): void {
    this.suppressed.add(obj);
  }

  handleMessage(message: unknown): void {
    if (isApplyEditResponse(message) || isApplyEditError(message)) {
      const waiting = this.pending.get(message.requestId);
      if (!waiting) return; // a response to a request we're no longer tracking - ignore
      this.pending.delete(message.requestId);
      if (isApplyEditError(message)) waiting.reject(new Error(message.message));
      else waiting.resolve();
      return;
    }
    if (isCreateChildResponse(message) || isCreateChildError(message)) {
      const waiting = this.pendingChildCreation.get(message.requestId);
      if (!waiting) return;
      this.pendingChildCreation.delete(message.requestId);
      if (isCreateChildError(message)) waiting.reject(new Error(message.message));
      else waiting.resolve(message.childId);
    }
  }

  /** "Add child": creates classId's instance and adds it to parentId's own featureId, host-side,
   *  atomically - resolves with the new child's own, real host id. See suppressNext's own
   *  reasoning for what the caller still needs to do afterward (a local, suppressed mutation of
   *  its own already-displayed parent object) - this method only handles the host-side half. */
  async createChild(parentId: string, featureId: string, classId: string, position?: number): Promise<string> {
    const requestId = String(this.nextRequestId++);
    return new Promise<string>((resolve, reject) => {
      this.pendingChildCreation.set(requestId, { resolve, reject });
      const request: CreateChildRequest = {
        type: 'typemf/createChild',
        requestId,
        parentId,
        featureId,
        classId,
        position,
      };
      this.transport.postMessage(request);
    });
  }

  /**
   * Relays one Notification - resolving immediately if relayNotification finds it genuinely not
   * relayable (an expected, silent no-op - see its own reasoning), or posting a visible
   * EditRelayFailedMessage (in addition to rejecting, so attachTo's own catch still logs it too)
   * if relayNotification reports a real problem instead of returning a request at all.
   */
  async send(notification: Notification, registry: WebviewObjectRegistry): Promise<void> {
    const requestId = String(this.nextRequestId++);
    const outcome = relayNotification(notification, registry, requestId);
    if (outcome === undefined) return;
    if ('reason' in outcome) {
      const failure: EditRelayFailedMessage = { type: 'typemf/editRelayFailed', reason: outcome.reason };
      this.transport.postMessage(failure);
      throw new Error(outcome.reason);
    }
    return new Promise<void>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      this.transport.postMessage(outcome);
    });
  }

  /**
   * Every future local edit on `obj` is sent to the host automatically from here on. A failed
   * relay (network-equivalent failure, or a genuine ApplyEditError from the host) is logged, not
   * thrown - onDidChange listeners have no caller to propagate a rejection to, since eSet() itself
   * is synchronous and has already returned by the time this fires.
   */
  attachTo(obj: EObject, registry: WebviewObjectRegistry): Disposable {
    return obj.onDidChange((notification) => {
      // Reconstruction bookkeeping, not a real edit - see suppressingReconstruction's own
      // reasoning for why this has to be checked regardless of which object fired it.
      if (this.suppressingReconstruction > 0) return;
      // See suppressed's own reasoning - checked (and cleared) first, before anything else, for
      // every single notification this object fires, not just ones from createChild's own flow.
      if (this.suppressed.delete(obj)) return;
      void this.send(notification, registry).catch((err: Error) => {
        console.error(`Failed to relay an edit to the extension host: ${err.message}`);
      });
    });
  }
}
