import { AncestorChainRequest, isAncestorChainError, isAncestorChainResponse } from './host-message-protocol.js';
import { PostMessageTransport } from './host-message-uri-converter.js';

/**
 * For "follow reference": the ordered chain of ancestor ids (root first, the target's own id
 * last) the tree needs to expand to reveal and select some object - a fourth, dedicated
 * correlation class alongside HostMessageUriConverter (resolve), EditRelay (mutate), and
 * ConcreteSubtypesQuery (an earlier query) - see ConcreteSubtypesQuery's own reasoning for why a
 * genuinely different shape of operation gets its own class rather than folding into one of the
 * others.
 */
export class AncestorChainQuery {
  private readonly pending = new Map<string, { resolve: (chainIds: string[]) => void; reject: (err: Error) => void }>();
  private nextRequestId = 1;

  constructor(private readonly transport: PostMessageTransport) {}

  handleMessage(message: unknown): void {
    if (!isAncestorChainResponse(message) && !isAncestorChainError(message)) return;
    const waiting = this.pending.get(message.requestId);
    if (!waiting) return;
    this.pending.delete(message.requestId);
    if (isAncestorChainError(message)) waiting.reject(new Error(message.message));
    else waiting.resolve(message.chainIds);
  }

  /** Root first, id itself last. */
  async query(id: string): Promise<string[]> {
    const requestId = String(this.nextRequestId++);
    return new Promise<string[]>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      const request: AncestorChainRequest = { type: 'typemf/ancestorChain', requestId, id };
      this.transport.postMessage(request);
    });
  }
}
