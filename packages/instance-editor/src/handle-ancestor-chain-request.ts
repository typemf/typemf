import { EObject } from '@typemf/core';
import { AncestorChainError, AncestorChainRequest, AncestorChainResponse } from './host-message-protocol.js';
import { ObjectIdMap } from './object-id-map.js';

/**
 * Walks request.id's real, connected eContainer() chain (this only works host-side - see
 * AncestorChainRequest's own reasoning) up to its document root, returning every ancestor's own
 * id, root first, the requested object's own id last. Same `{ objectIds }` narrowing as the other
 * handlers, for the same reason (no real vscode dependency needed for the actual logic).
 */
export function handleAncestorChainRequest(
  request: AncestorChainRequest,
  document: { objectIds: ObjectIdMap }
): AncestorChainResponse | AncestorChainError {
  const target = document.objectIds.objectFor(request.id);
  if (!target) {
    return {
      type: 'typemf/ancestorChainError',
      requestId: request.requestId,
      message: `No object known for id '${request.id}'.`,
    };
  }

  const chain: EObject[] = [target];
  let current: EObject | undefined = target;
  while ((current = current.eContainer())) {
    chain.unshift(current);
  }

  return {
    type: 'typemf/ancestorChainResult',
    requestId: request.requestId,
    chainIds: chain.map((obj) => document.objectIds.idFor(obj)),
  };
}
