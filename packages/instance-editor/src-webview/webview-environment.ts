import { ResourceSet, ResourceSetImpl } from '@typemf/core';
import { AncestorChainQuery } from '../src/ancestor-chain-query.js';
import { BrowseExternalReferenceQuery } from '../src/browse-external-reference-query.js';
import { ConcreteSubtypesQuery } from '../src/concrete-subtypes-query.js';
import { EditRelay } from '../src/edit-relay.js';
import { HostMessageUriConverter } from '../src/host-message-uri-converter.js';
import { ReferenceCandidatesQuery } from '../src/reference-candidates-query.js';
import { registerHostProtocol } from '../src/snapshot-serializer.js';
import { WebviewObjectRegistry } from '../src/webview-object-registry.js';
import { vscodeApi } from './vscode-api.js';

export interface WebviewEnvironment {
  resourceSet: ResourceSet;
  objectRegistry: WebviewObjectRegistry;
  concreteSubtypesQuery: ConcreteSubtypesQuery;
  ancestorChainQuery: AncestorChainQuery;
  referenceCandidatesQuery: ReferenceCandidatesQuery;
  browseExternalReferenceQuery: BrowseExternalReferenceQuery;
  editRelay: EditRelay;
  /** Raw, unrouted messages from the extension host - main.tsx itself still needs to see
   *  typemf/init directly (none of the seven things above know what that message means). */
  onMessage: (listener: (message: unknown) => void) => () => void;
}

/**
 * One instance for the whole webview session - not per-document (unlike ObjectIdMap on the host
 * side, which is genuinely per-document; a single webview only ever shows one document at a time
 * anyway, so there is nothing to keep separate here).
 */
export function createWebviewEnvironment(): WebviewEnvironment {
  const converter = new HostMessageUriConverter(vscodeApi);
  const editRelay = new EditRelay(vscodeApi);
  const concreteSubtypesQuery = new ConcreteSubtypesQuery(vscodeApi);
  const ancestorChainQuery = new AncestorChainQuery(vscodeApi);
  const referenceCandidatesQuery = new ReferenceCandidatesQuery(vscodeApi);
  const browseExternalReferenceQuery = new BrowseExternalReferenceQuery(vscodeApi);
  const objectRegistry = new WebviewObjectRegistry();

  const resourceSet = new ResourceSetImpl();
  registerHostProtocol(resourceSet.getResourceFactoryRegistry(), objectRegistry, editRelay);
  resourceSet.getUriConverterRegistry().register(converter);

  const rawListeners = new Set<(message: unknown) => void>();
  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    // Each handleMessage is a no-op for a message type it doesn't recognize (checked internally),
    // so dispatching to all three unconditionally is safe - no separate routing switch needed.
    converter.handleMessage(event.data);
    editRelay.handleMessage(event.data);
    concreteSubtypesQuery.handleMessage(event.data);
    ancestorChainQuery.handleMessage(event.data);
    referenceCandidatesQuery.handleMessage(event.data);
    browseExternalReferenceQuery.handleMessage(event.data);
    for (const listener of rawListeners) listener(event.data);
  });

  return {
    resourceSet,
    objectRegistry,
    concreteSubtypesQuery,
    ancestorChainQuery,
    referenceCandidatesQuery,
    browseExternalReferenceQuery,
    editRelay,
    onMessage: (listener) => {
      rawListeners.add(listener);
      return () => rawListeners.delete(listener);
    },
  };
}
