import { Resource } from '@typemf/core';
import { InitMessage } from './host-message-protocol.js';
import { ObjectIdMap } from './object-id-map.js';

/**
 * The things the webview cannot discover any other way - which object is this document's own
 * root, and the "Show derived features" setting's own current value (read by the caller via a
 * real vscode.workspace.getConfiguration() call - nothing this narrowed, vscode-free function
 * itself could do). Same `{ objectIds }`/`{ resource }` narrowing as the other handlers, for the
 * same reason (InstanceDocument's own vscode.Uri can't be constructed outside a real extension
 * host).
 */
export function handleReadyMessage(
  document: { objectIds: ObjectIdMap; resource: Resource },
  showDerivedFeatures: boolean
): InitMessage {
  const contents = document.resource.getContents();
  const root = contents.isEmpty() ? undefined : contents.get(0);
  return { type: 'typemf/init', rootId: root ? document.objectIds.idFor(root) : undefined, showDerivedFeatures };
}
