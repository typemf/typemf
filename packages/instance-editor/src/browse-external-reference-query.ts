import { BrowseExternalReferenceRequest, isBrowseExternalReferenceError, isBrowseExternalReferenceResponse } from './host-message-protocol.js';
import { PostMessageTransport } from './host-message-uri-converter.js';

export interface ExternalReferenceResult {
  candidateIds: string[];
  cancelled: boolean;
}

/**
 * "Link external..." - mirrors ReferenceCandidatesQuery's own pattern exactly, the seventh
 * dedicated correlation class (see ConcreteSubtypesQuery's own reasoning for why). The only real
 * difference from ReferenceCandidatesQuery is the extra `cancelled` flag the response carries -
 * see BrowseExternalReferenceResponse's own reasoning for why that's worth distinguishing from a
 * genuine "nothing compatible in that file" result.
 */
export class BrowseExternalReferenceQuery {
  private readonly pending = new Map<string, { resolve: (result: ExternalReferenceResult) => void; reject: (err: Error) => void }>();
  private nextRequestId = 1;

  constructor(private readonly transport: PostMessageTransport) {}

  handleMessage(message: unknown): void {
    if (!isBrowseExternalReferenceResponse(message) && !isBrowseExternalReferenceError(message)) return;
    const waiting = this.pending.get(message.requestId);
    if (!waiting) return;
    this.pending.delete(message.requestId);
    if (isBrowseExternalReferenceError(message)) waiting.reject(new Error(message.message));
    else waiting.resolve({ candidateIds: message.candidateIds, cancelled: message.cancelled });
  }

  async query(typeId: string): Promise<ExternalReferenceResult> {
    const requestId = String(this.nextRequestId++);
    return new Promise<ExternalReferenceResult>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      const request: BrowseExternalReferenceRequest = { type: 'typemf/browseExternalReference', requestId, typeId };
      this.transport.postMessage(request);
    });
  }
}
