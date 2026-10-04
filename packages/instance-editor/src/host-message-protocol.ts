import { ObjectSnapshot } from './snapshot-object.js';

/** Sent by the webview, asking the extension host for one object's current snapshot. */
export interface GetObjectRequest {
  type: 'typemf/getObject';
  requestId: string;
  id: string;
}

/** Sent by the extension host, in reply to a GetObjectRequest with the same requestId. */
export interface GetObjectResponse {
  type: 'typemf/getObjectResult';
  requestId: string;
  snapshot: ObjectSnapshot;
}

/** Sent by the extension host instead of GetObjectResponse when `id` doesn't resolve to a real,
 *  currently-known object (e.g. it was since removed, or the id is simply invalid). */
export interface GetObjectError {
  type: 'typemf/getObjectError';
  requestId: string;
  message: string;
}

/**
 * A value crossing the wire as part of an edit - either a primitive (encoded the same way
 * @typemf/json's own encodeAttributeValue would) or a reference to another object, by its own
 * host id (never an inline object - references never cross this boundary any other way,
 * matching ObjectSnapshot's own "always an id, never an embedded object" rule).
 */
export type WireValue = { ref: string } | { primitive: unknown };

/**
 * Sent by the webview - one real, already-happened local edit (an EObject.onDidChange
 * Notification, relayed), asking the host to replay the equivalent operation on the real object.
 * Deliberately mirrors Notification's own shape closely, rather than inventing a different one -
 * only the four event types this project's own eNotify call sites actually ever fire (SET/UNSET/
 * ADD/REMOVE - never MOVE/RESOLVE/CREATE/ADD_MANY/REMOVE_MANY, at least not yet) are represented.
 */
export interface ApplyEditRequest {
  type: 'typemf/applyEdit';
  requestId: string;
  objectId: string;
  featureId: string;
  eventType: 'SET' | 'UNSET' | 'ADD' | 'REMOVE';
  /** Absent for UNSET and REMOVE (REMOVE identifies what to remove via oldValue, not newValue -
   *  see relay-notification.ts's own reasoning for using the removed value over position). */
  value?: WireValue;
  position?: number;
}

/** Sent by the host once an ApplyEditRequest has been genuinely applied to the real object. */
export interface ApplyEditResponse {
  type: 'typemf/applyEditResult';
  requestId: string;
}

/** Sent by the host instead of ApplyEditResponse when the edit could not be applied. */
export interface ApplyEditError {
  type: 'typemf/applyEditError';
  requestId: string;
  message: string;
}

export function isApplyEditRequest(message: unknown): message is ApplyEditRequest {
  return typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/applyEdit';
}

export function isApplyEditResponse(message: unknown): message is ApplyEditResponse {
  return (
    typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/applyEditResult'
  );
}

export function isApplyEditError(message: unknown): message is ApplyEditError {
  return (
    typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/applyEditError'
  );
}

/**
 * Sent by the webview for child creation - "which concrete classes can actually be created here",
 * when a containment feature's own declared type might be abstract or an interface (or even when
 * it isn't - a concrete declared type is a valid answer too, see concreteSubtypesOf's own
 * reasoning). `classId` is the declared type to query against.
 */
export interface ConcreteSubtypesRequest {
  type: 'typemf/concreteSubtypes';
  requestId: string;
  classId: string;
}

/** classIds - opaque ids only, same as everywhere else; the webview resolves each one normally
 *  through the existing proxy/resolve machinery to get a real, usable EClass for its picker. */
export interface ConcreteSubtypesResponse {
  type: 'typemf/concreteSubtypesResult';
  requestId: string;
  classIds: string[];
}

export interface ConcreteSubtypesError {
  type: 'typemf/concreteSubtypesError';
  requestId: string;
  message: string;
}

export function isConcreteSubtypesRequest(message: unknown): message is ConcreteSubtypesRequest {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/concreteSubtypes'
  );
}

export function isConcreteSubtypesResponse(message: unknown): message is ConcreteSubtypesResponse {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/concreteSubtypesResult'
  );
}

export function isConcreteSubtypesError(message: unknown): message is ConcreteSubtypesError {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/concreteSubtypesError'
  );
}

/**
 * Sent by the webview for "follow reference" - given an object's id, the ordered chain of its own
 * containing ancestors, root first, id itself last - everything the tree needs to expand on the
 * way to revealing and selecting it. Computed host-side via the real, connected eContainer()
 * chain, since the webview's own reconstructed objects never form one themselves (each is its own
 * separate, standalone resource root the moment it's lazily fetched - see SnapshotSerializer's own
 * reasoning) - there is no way to walk "who's my parent" locally on the webview side at all.
 */
export interface AncestorChainRequest {
  type: 'typemf/ancestorChain';
  requestId: string;
  id: string;
}

/** chainIds - root first, the requested object's own id last; a lone-element array for a
 *  document's own root (nothing above it to expand). */
export interface AncestorChainResponse {
  type: 'typemf/ancestorChainResult';
  requestId: string;
  chainIds: string[];
}

export interface AncestorChainError {
  type: 'typemf/ancestorChainError';
  requestId: string;
  message: string;
}

export function isAncestorChainRequest(message: unknown): message is AncestorChainRequest {
  return (
    typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/ancestorChain'
  );
}

export function isAncestorChainResponse(message: unknown): message is AncestorChainResponse {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/ancestorChainResult'
  );
}

export function isAncestorChainError(message: unknown): message is AncestorChainError {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/ancestorChainError'
  );
}

/**
 * Sent by the webview for "add child" on a containment feature - create a new instance of
 * classId and add it to parentId's own featureId (at position, for a many-valued feature;
 * appended if omitted), atomically, host-side. classId is always a concrete EClass - the webview
 * itself is responsible for resolving "which concrete subtype" first (via ConcreteSubtypesQuery),
 * skipping that picker entirely when only one concrete option exists - this request only ever
 * carries the final, already-decided answer.
 */
export interface CreateChildRequest {
  type: 'typemf/createChild';
  requestId: string;
  parentId: string;
  featureId: string;
  classId: string;
  position?: number;
}

/** childId - the new object's own, real, freshly-minted host id; the webview resolves it
 *  normally through the existing GetObjectRequest mechanism to get a real, fully-populated
 *  object, exactly as it would for anything else it doesn't have locally yet. */
export interface CreateChildResponse {
  type: 'typemf/createChildResult';
  requestId: string;
  childId: string;
}

export interface CreateChildError {
  type: 'typemf/createChildError';
  requestId: string;
  message: string;
}

export function isCreateChildRequest(message: unknown): message is CreateChildRequest {
  return (
    typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/createChild'
  );
}

export function isCreateChildResponse(message: unknown): message is CreateChildResponse {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/createChildResult'
  );
}

export function isCreateChildError(message: unknown): message is CreateChildError {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/createChildError'
  );
}

/**
 * Sent by the webview for the reference picker (a NON-containment reference - "pick an existing
 * object", as opposed to CreateChildRequest's "create a brand new one") - every object currently
 * in this document whose own class is typeId or one of its subtypes (isSuperTypeOf's own
 * reflexive semantics - see concreteSubtypesOf's own confirmed reasoning), found by walking the
 * document's own real containment tree, host-side (eAllContents() - only meaningful there; the
 * webview's own reconstructed objects never form a connected tree themselves - see
 * AncestorChainRequest's own reasoning for the same underlying fact).
 */
export interface ReferenceCandidatesRequest {
  type: 'typemf/referenceCandidates';
  requestId: string;
  typeId: string;
}

/** candidateIds - the webview resolves each one normally through the existing proxy/resolve
 *  machinery (exactly like ConcreteSubtypesResponse's own classIds) to get a real, usable object
 *  for its picker, including a real displayLabel(). */
export interface ReferenceCandidatesResponse {
  type: 'typemf/referenceCandidatesResult';
  requestId: string;
  candidateIds: string[];
}

export interface ReferenceCandidatesError {
  type: 'typemf/referenceCandidatesError';
  requestId: string;
  message: string;
}

export function isReferenceCandidatesRequest(message: unknown): message is ReferenceCandidatesRequest {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/referenceCandidates'
  );
}

export function isReferenceCandidatesResponse(message: unknown): message is ReferenceCandidatesResponse {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/referenceCandidatesResult'
  );
}

export function isReferenceCandidatesError(message: unknown): message is ReferenceCandidatesError {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/referenceCandidatesError'
  );
}

/**
 * Sent by the webview for "Link external..." - the cross-document counterpart to
 * ReferenceCandidatesRequest's own "pick an existing object" (which only ever searches the
 * current document). Unlike every other request here, handling this one genuinely needs real
 * vscode APIs (showOpenDialog, workspace.fs.readFile) - see browse-external-reference.ts's own
 * reasoning - so it's not handled by one of the narrowly-testable `{ objectIds }`-style functions
 * the others are.
 */
export interface BrowseExternalReferenceRequest {
  type: 'typemf/browseExternalReference';
  requestId: string;
  typeId: string;
}

/** candidateIds - every type-compatible object found in the picked file, registered into this
 *  document's own ObjectIdMap already (so the webview can resolve each one normally, exactly like
 *  ReferenceCandidatesResponse's own candidateIds). cancelled distinguishes "the user dismissed
 *  the file picker" from "the file had nothing compatible in it" - both leave candidateIds empty,
 *  but only one is worth a different message in the UI. */
export interface BrowseExternalReferenceResponse {
  type: 'typemf/browseExternalReferenceResult';
  requestId: string;
  candidateIds: string[];
  cancelled: boolean;
}

export interface BrowseExternalReferenceError {
  type: 'typemf/browseExternalReferenceError';
  requestId: string;
  message: string;
}

export function isBrowseExternalReferenceRequest(message: unknown): message is BrowseExternalReferenceRequest {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/browseExternalReference'
  );
}

export function isBrowseExternalReferenceResponse(message: unknown): message is BrowseExternalReferenceResponse {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/browseExternalReferenceResult'
  );
}

export function isBrowseExternalReferenceError(message: unknown): message is BrowseExternalReferenceError {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'typemf/browseExternalReferenceError'
  );
}

/** Sent by the webview once its own JS has loaded and is ready to receive - mirrors
 *  tmf-ecore-editor's own 'ready' -> loadModel handshake, adapted: this sends just the root's id
 *  (everything else is fetched lazily through the existing GetObjectRequest mechanism), not the
 *  whole document. */
export interface ReadyMessage {
  type: 'typemf/ready';
}

/** Sent by the host in reply to ReadyMessage - the one thing the webview cannot discover any
 *  other way, since nothing else identifies which object is this document's own root. rootId is
 *  undefined only for a genuinely empty document (no root at all) - the webview shows an empty
 *  state rather than treating an empty string as a real-looking id. */
export interface InitMessage {
  type: 'typemf/init';
  rootId: string | undefined;
  /** The "Show derived features" setting's own current value - bundled into the one-time init
   *  handshake (the webview's own synchronization point: it only ever sends typemf/ready once,
   *  right when it's actually ready to receive), not a separate round trip. Live changes after
   *  that go through SettingsMessage instead, below. */
  showDerivedFeatures: boolean;
}

/**
 * Sent whenever the "Show derived features" setting changes while a document is already open -
 * vscode.workspace.onDidChangeConfiguration, scoped to this one webview's own lifetime. Not sent
 * at init time at all (InitMessage's own showDerivedFeatures field already covers that moment);
 * this is for a live change only, same split InitMessage/AncestorChainRequest already draws
 * elsewhere between "the one-time handshake already covers this" and "a dedicated message for
 * anything after that."
 */
export interface SettingsMessage {
  type: 'typemf/settings';
  showDerivedFeatures: boolean;
}

export function isSettingsMessage(message: unknown): message is SettingsMessage {
  return typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/settings';
}

export function isReadyMessage(message: unknown): message is ReadyMessage {
  return typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/ready';
}

export function isInitMessage(message: unknown): message is InitMessage {
  return typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/init';
}

export function isGetObjectRequest(message: unknown): message is GetObjectRequest {
  return typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/getObject';
}

export function isGetObjectResponse(message: unknown): message is GetObjectResponse {
  return (
    typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/getObjectResult'
  );
}

export function isGetObjectError(message: unknown): message is GetObjectError {
  return (
    typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/getObjectError'
  );
}

/**
 * Sent by the webview when a real, user-initiated edit could not be relayed to the host at all -
 * distinct from ApplyEditError (a request the host genuinely received and rejected): this is for
 * a request that was never even sent, because relayNotification couldn't translate it (a real,
 * confirmed gap found while investigating a report of "edits look fine in the UI, but the saved
 * file never reflects them, with no visible error anywhere" - EditRelay.attachTo's own catch
 * handler, and relayNotification's own !objectId/!featureId early return, both used to be
 * entirely silent, console.error at best, something a user debugging a real data-loss problem
 * would have no way to discover without opening devtools). The host's own handling of this
 * message is intentionally just a visible notification, not a recovery mechanism - by the time
 * this arrives, the local (webview-side) edit already happened and the host-side object did not,
 * so the two are now out of sync; the honest, safe response is telling the person, not guessing
 * at a fix.
 */
export interface EditRelayFailedMessage {
  type: 'typemf/editRelayFailed';
  reason: string;
}

export function isEditRelayFailedMessage(message: unknown): message is EditRelayFailedMessage {
  return (
    typeof message === 'object' && message !== null && (message as { type?: unknown }).type === 'typemf/editRelayFailed'
  );
}
