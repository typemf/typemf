import { ConcreteSubtypesRequest, isConcreteSubtypesError, isConcreteSubtypesResponse } from './host-message-protocol.js';
import { PostMessageTransport } from './host-message-uri-converter.js';

/**
 * For child creation: "which concrete classes can I actually offer here" - a third, dedicated
 * correlation class alongside HostMessageUriConverter (resolve) and EditRelay (mutate), rather
 * than folded into either: a criterion-based search returning a list of new ids the webview
 * didn't have yet is a genuinely different shape of operation from both of those (see this
 * session's own "resolve vs query vs mutate" framing from when the protocol was first sketched).
 */
export class ConcreteSubtypesQuery {
  private readonly pending = new Map<string, { resolve: (ids: string[]) => void; reject: (err: Error) => void }>();
  private nextRequestId = 1;

  constructor(private readonly transport: PostMessageTransport) {}

  handleMessage(message: unknown): void {
    if (!isConcreteSubtypesResponse(message) && !isConcreteSubtypesError(message)) return;
    const waiting = this.pending.get(message.requestId);
    if (!waiting) return;
    this.pending.delete(message.requestId);
    if (isConcreteSubtypesError(message)) waiting.reject(new Error(message.message));
    else waiting.resolve(message.classIds);
  }

  /** The ids of every concrete class classId itself or one of its subtypes - resolve each one
   *  normally through the existing proxy/resolve machinery to get a real, usable EClass. */
  async query(classId: string): Promise<string[]> {
    const requestId = String(this.nextRequestId++);
    return new Promise<string[]>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      const request: ConcreteSubtypesRequest = { type: 'typemf/concreteSubtypes', requestId, classId };
      this.transport.postMessage(request);
    });
  }
}
