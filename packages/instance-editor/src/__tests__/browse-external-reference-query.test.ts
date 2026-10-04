import { describe, expect, it } from 'vitest';
import { BrowseExternalReferenceQuery } from '../browse-external-reference-query.js';
import { BrowseExternalReferenceRequest, isBrowseExternalReferenceRequest } from '../host-message-protocol.js';
import { PostMessageTransport } from '../host-message-uri-converter.js';

class FakeTransport implements PostMessageTransport {
  readonly sent: unknown[] = [];
  postMessage(message: unknown): void {
    this.sent.push(message);
  }
  lastRequest(): BrowseExternalReferenceRequest {
    const request = [...this.sent].reverse().find(isBrowseExternalReferenceRequest);
    if (!request) throw new Error('no BrowseExternalReferenceRequest was ever sent');
    return request;
  }
}

describe('BrowseExternalReferenceQuery', () => {
  it('sends a BrowseExternalReferenceRequest and resolves with the candidates of the matching response', async () => {
    const transport = new FakeTransport();
    const query = new BrowseExternalReferenceQuery(transport);

    const pending = query.query('book-class-id');
    const request = transport.lastRequest();
    expect(request.typeId).toBe('book-class-id');

    query.handleMessage({
      type: 'typemf/browseExternalReferenceResult',
      requestId: request.requestId,
      candidateIds: ['book-1'],
      cancelled: false,
    });

    expect(await pending).toEqual({ candidateIds: ['book-1'], cancelled: false });
  });

  it('resolves with cancelled: true when the user dismisses the file picker', async () => {
    const transport = new FakeTransport();
    const query = new BrowseExternalReferenceQuery(transport);

    const pending = query.query('book-class-id');
    const request = transport.lastRequest();
    query.handleMessage({
      type: 'typemf/browseExternalReferenceResult',
      requestId: request.requestId,
      candidateIds: [],
      cancelled: true,
    });

    await expect(pending).resolves.toEqual({ candidateIds: [], cancelled: true });
  });

  it('rejects when a matching BrowseExternalReferenceError arrives instead', async () => {
    const transport = new FakeTransport();
    const query = new BrowseExternalReferenceQuery(transport);

    const pending = query.query('unknown-type');
    const request = transport.lastRequest();
    query.handleMessage({
      type: 'typemf/browseExternalReferenceError',
      requestId: request.requestId,
      message: 'no class known',
    });

    await expect(pending).rejects.toThrow('no class known');
  });

  it('ignores a response with another requestId', async () => {
    const transport = new FakeTransport();
    const query = new BrowseExternalReferenceQuery(transport);

    const pending = query.query('book-class-id');
    const request = transport.lastRequest();

    query.handleMessage({
      type: 'typemf/browseExternalReferenceResult',
      requestId: 'unrelated',
      candidateIds: ['wrong'],
      cancelled: false,
    });
    query.handleMessage({
      type: 'typemf/browseExternalReferenceResult',
      requestId: request.requestId,
      candidateIds: ['right'],
      cancelled: false,
    });

    expect(await pending).toEqual({ candidateIds: ['right'], cancelled: false });
  });

  it('handleMessage ignores unrelated message types', () => {
    const query = new BrowseExternalReferenceQuery(new FakeTransport());
    expect(() => query.handleMessage({ type: 'something/else' })).not.toThrow();
    expect(() => query.handleMessage(null)).not.toThrow();
  });
});
