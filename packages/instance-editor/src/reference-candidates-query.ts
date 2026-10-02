import {
  ReferenceCandidatesRequest,
  isReferenceCandidatesError,
  isReferenceCandidatesResponse,
} from './host-message-protocol.js';
import { PostMessageTransport } from './host-message-uri-converter.js';

/**
 * For the reference picker: every object currently in the document compatible with a given type -
 * a fifth dedicated correlation class alongside HostMessageUriConverter (resolve), EditRelay
 * (mutate), ConcreteSubtypesQuery, and AncestorChainQuery (two earlier queries) - see
 * ConcreteSubtypesQuery's own reasoning for why a genuinely different shape of operation gets its
 * own class rather than folding into one of the others.
 */
export class ReferenceCandidatesQuery {
  private readonly pending = new Map<
    string,
    { resolve: (candidateIds: string[]) => void; reject: (err: Error) => void }
  >();
  private nextRequestId = 1;

  constructor(private readonly transport: PostMessageTransport) {}

  handleMessage(message: unknown): void {
    if (!isReferenceCandidatesResponse(message) && !isReferenceCandidatesError(message)) return;
    const waiting = this.pending.get(message.requestId);
    if (!waiting) return;
    this.pending.delete(message.requestId);
    if (isReferenceCandidatesError(message)) waiting.reject(new Error(message.message));
    else waiting.resolve(message.candidateIds);
  }

  async query(typeId: string): Promise<string[]> {
    const requestId = String(this.nextRequestId++);
    return new Promise<string[]>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      const request: ReferenceCandidatesRequest = { type: 'typemf/referenceCandidates', requestId, typeId };
      this.transport.postMessage(request);
    });
  }
}
