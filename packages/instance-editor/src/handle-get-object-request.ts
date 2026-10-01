import { GetObjectError, GetObjectRequest, GetObjectResponse } from './host-message-protocol.js';
import { ObjectIdMap } from './object-id-map.js';
import { snapshotObject } from './snapshot-object.js';

/**
 * Looks `request.id` up in `document`'s own ObjectIdMap and snapshots it - or, if the id doesn't
 * resolve to a real, currently-known object, produces a clear GetObjectError instead. Pure logic,
 * deliberately no `vscode` dependency at all: the real message wiring
 * (webviewPanel.webview.onDidReceiveMessage calling this, then posting the result back via
 * webviewPanel.webview.postMessage) is InstanceEditorProvider's own, separate responsibility -
 * this function is what makes that wiring itself trivial to keep thin and untested-but-obviously-
 * correct, with the actual logic fully covered here instead.
 *
 * Takes just `{ objectIds }`, not the full InstanceDocument, deliberately: InstanceDocument's own
 * constructor needs a real vscode.Uri, which can't be constructed outside a real extension host
 * (@types/vscode is types-only, no runtime implementation at all) - narrowing to the one field
 * this actually uses keeps it genuinely unit-testable with no vscode present, while a real
 * InstanceDocument still satisfies this structurally, with no change needed at the real call site.
 */
export function handleGetObjectRequest(request: GetObjectRequest, document: { objectIds: ObjectIdMap }): GetObjectResponse | GetObjectError {
  const obj = document.objectIds.objectFor(request.id);
  if (!obj) {
    return { type: 'typemf/getObjectError', requestId: request.requestId, message: `No object known for id '${request.id}'.` };
  }
  return { type: 'typemf/getObjectResult', requestId: request.requestId, snapshot: snapshotObject(obj, document.objectIds) };
}
