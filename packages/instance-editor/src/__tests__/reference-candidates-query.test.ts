import { describe, expect, it } from 'vitest';
import { ReferenceCandidatesQuery } from '../reference-candidates-query.js';
import { ReferenceCandidatesRequest, isReferenceCandidatesRequest } from '../host-message-protocol.js';
import { PostMessageTransport } from '../host-message-uri-converter.js';

class FakeTransport implements PostMessageTransport {
  readonly sent: unknown[] = [];
  postMessage(message: unknown): void {
    this.sent.push(message);
  }
  lastRequest(): ReferenceCandidatesRequest {
    const request = [...this.sent].reverse().find(isReferenceCandidatesRequest);
    if (!request) throw new Error('no ReferenceCandidatesRequest was ever sent');
    return request;
  }
}

describe('ReferenceCandidatesQuery', () => {
  it('sends a ReferenceCandidatesRequest and resolves with the candidates of the matching response', async () => {
    const transport = new FakeTransport();
    const query = new ReferenceCandidatesQuery(transport);

    const pending = query.query('book-class-id');
    const request = transport.lastRequest();
    expect(request.typeId).toBe('book-class-id');

    query.handleMessage({
      type: 'typemf/referenceCandidatesResult',
      requestId: request.requestId,
      candidateIds: ['book-1', 'book-2'],
    });

    expect(await pending).toEqual(['book-1', 'book-2']);
  });

  it('rejects when a matching ReferenceCandidatesError arrives instead', async () => {
    const transport = new FakeTransport();
    const query = new ReferenceCandidatesQuery(transport);

    const pending = query.query('unknown-type');
    const request = transport.lastRequest();
    query.handleMessage({
      type: 'typemf/referenceCandidatesError',
      requestId: request.requestId,
      message: 'no class known',
    });

    await expect(pending).rejects.toThrow('no class known');
  });

  it('ignores a response with another requestId', async () => {
    const transport = new FakeTransport();
    const query = new ReferenceCandidatesQuery(transport);

    const pending = query.query('book-class-id');
    const request = transport.lastRequest();

    query.handleMessage({ type: 'typemf/referenceCandidatesResult', requestId: 'unrelated', candidateIds: ['wrong'] });
    query.handleMessage({
      type: 'typemf/referenceCandidatesResult',
      requestId: request.requestId,
      candidateIds: ['right'],
    });

    expect(await pending).toEqual(['right']);
  });

  it('handleMessage ignores unrelated message types', () => {
    const query = new ReferenceCandidatesQuery(new FakeTransport());
    expect(() => query.handleMessage({ type: 'something/else' })).not.toThrow();
    expect(() => query.handleMessage(null)).not.toThrow();
  });
});
