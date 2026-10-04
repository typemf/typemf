import { describe, expect, it } from 'vitest';
import { AncestorChainQuery } from '../ancestor-chain-query.js';
import { AncestorChainRequest, isAncestorChainRequest } from '../host-message-protocol.js';
import { PostMessageTransport } from '../host-message-uri-converter.js';

class FakeTransport implements PostMessageTransport {
  readonly sent: unknown[] = [];
  postMessage(message: unknown): void {
    this.sent.push(message);
  }
  lastRequest(): AncestorChainRequest {
    const request = [...this.sent].reverse().find(isAncestorChainRequest);
    if (!request) throw new Error('no AncestorChainRequest was ever sent');
    return request;
  }
}

describe('AncestorChainQuery', () => {
  it('sends an AncestorChainRequest and resolves with the chain of the matching response', async () => {
    const transport = new FakeTransport();
    const query = new AncestorChainQuery(transport);

    const pending = query.query('book-id');
    const request = transport.lastRequest();
    expect(request.id).toBe('book-id');

    query.handleMessage({
      type: 'typemf/ancestorChainResult',
      requestId: request.requestId,
      chainIds: ['library-id', 'book-id'],
    });

    expect(await pending).toEqual(['library-id', 'book-id']);
  });

  it('rejects when a matching AncestorChainError arrives instead', async () => {
    const transport = new FakeTransport();
    const query = new AncestorChainQuery(transport);

    const pending = query.query('unknown-id');
    const request = transport.lastRequest();
    query.handleMessage({
      type: 'typemf/ancestorChainError',
      requestId: request.requestId,
      message: 'no object known',
    });

    await expect(pending).rejects.toThrow('no object known');
  });

  it('ignores a response with another requestId', async () => {
    const transport = new FakeTransport();
    const query = new AncestorChainQuery(transport);

    const pending = query.query('book-id');
    const request = transport.lastRequest();

    query.handleMessage({ type: 'typemf/ancestorChainResult', requestId: 'unrelated', chainIds: ['wrong'] });
    query.handleMessage({ type: 'typemf/ancestorChainResult', requestId: request.requestId, chainIds: ['right'] });

    expect(await pending).toEqual(['right']);
  });

  it('handleMessage ignores unrelated message types', () => {
    const query = new AncestorChainQuery(new FakeTransport());
    expect(() => query.handleMessage({ type: 'something/else' })).not.toThrow();
    expect(() => query.handleMessage(null)).not.toThrow();
  });
});
