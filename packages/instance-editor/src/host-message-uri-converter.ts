import { URI, UriConverter } from '@typemf/core';
import { HOST_SCHEME } from './snapshot-serializer.js';
import { GetObjectRequest, isGetObjectError, isGetObjectResponse } from './host-message-protocol.js';

/**
 * The one real capability this needs from its environment: send a message somewhere. In
 * production this is `vscode.postMessage` (called from inside the webview's own JS context, a
 * real browser environment - not the extension host, so no `import * as vscode from 'vscode'`
 * anywhere near this file). Injected specifically so the request/response correlation logic
 * below is fully unit-testable with a fake transport, with no real webview needed at all.
 */
export interface PostMessageTransport {
  postMessage(message: unknown): void;
}

/**
 * postMessage itself is fire-and-forget, with no built-in request/response correlation - this is
 * the small protocol that adds one: every readBinary() call mints its own requestId, sent as part
 * of a GetObjectRequest, and stays pending until handleMessage() is given a GetObjectResponse or
 * GetObjectError carrying that same requestId back. handleMessage is this class's own receive
 * side - the caller is responsible for actually wiring it to real incoming messages (in
 * production, `window.addEventListener('message', (e) => converter.handleMessage(e.data))`), kept
 * deliberately separate from construction so it, too, stays trivially fake-able in a test.
 */
export class HostMessageUriConverter implements UriConverter {
  private readonly pending = new Map<string, { resolve: (bytes: Uint8Array) => void; reject: (err: Error) => void }>();
  private nextRequestId = 1;

  constructor(private readonly transport: PostMessageTransport) {}

  canHandle(uri: URI): boolean {
    return uri.getScheme() === HOST_SCHEME;
  }

  handleMessage(message: unknown): void {
    if (!isGetObjectResponse(message) && !isGetObjectError(message)) return;
    const waiting = this.pending.get(message.requestId);
    if (!waiting) return; // a response to a request we're no longer tracking (e.g. already settled) - ignore
    this.pending.delete(message.requestId);
    if (isGetObjectError(message)) {
      waiting.reject(new Error(message.message));
    } else {
      waiting.resolve(new TextEncoder().encode(JSON.stringify(message.snapshot)));
    }
  }

  async readBinary(uri: URI): Promise<Uint8Array> {
    const id = uri.getPath().replace(/^\//, '');
    const requestId = String(this.nextRequestId++);
    return new Promise<Uint8Array>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      const request: GetObjectRequest = { type: 'typemf/getObject', requestId, id };
      this.transport.postMessage(request);
    });
  }

  async writeBinary(): Promise<void> {
    throw new Error('HostMessageUriConverter is read-only - it only ever fetches host objects, never writes them.');
  }

  async exists(): Promise<boolean> {
    // Any syntactically valid id is assumed to exist; a genuinely missing one surfaces as a clear
    // GetObjectError from readBinary() instead, rather than a separate existence round trip first.
    return true;
  }
}
