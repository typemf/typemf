import { URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { GetObjectRequest, isGetObjectRequest } from '../host-message-protocol.js';
import { HostMessageUriConverter, PostMessageTransport } from '../host-message-uri-converter.js';
import { uriForId } from '../snapshot-serializer.js';

/** Captures posted messages, and lets a test reply to a specific request whenever it chooses to. */
class FakeTransport implements PostMessageTransport {
  readonly sent: unknown[] = [];

  postMessage(message: unknown): void {
    this.sent.push(message);
  }

  lastRequest(): GetObjectRequest {
    const request = [...this.sent].reverse().find(isGetObjectRequest);
    if (!request) throw new Error('FakeTransport: no GetObjectRequest was ever sent.');
    return request;
  }
}

describe('HostMessageUriConverter', () => {
  it('canHandle accepts only the typemf-host scheme', () => {
    const converter = new HostMessageUriConverter(new FakeTransport());
    expect(converter.canHandle(uriForId('1'))).toBe(true);
    expect(converter.canHandle(URI.parse('file:/some/path.json'))).toBe(false);
  });

  it('readBinary sends a GetObjectRequest and resolves with the matching response', async () => {
    const transport = new FakeTransport();
    const converter = new HostMessageUriConverter(transport);

    const pending = converter.readBinary(uriForId('42'));
    const request = transport.lastRequest();
    expect(request.id).toBe('42');

    converter.handleMessage({
      type: 'typemf/getObjectResult',
      requestId: request.requestId,
      snapshot: { id: '42', eClassId: 'ecore:1', attributes: { title: 'Dune' }, references: {} },
    });

    const bytes = await pending;
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    expect(decoded.attributes.title).toBe('Dune');
  });

  it('readBinary rejects on a matching GetObjectError', async () => {
    const transport = new FakeTransport();
    const converter = new HostMessageUriConverter(transport);

    const pending = converter.readBinary(uriForId('missing'));
    const request = transport.lastRequest();

    converter.handleMessage({ type: 'typemf/getObjectError', requestId: request.requestId, message: 'not found' });

    await expect(pending).rejects.toThrow('not found');
  });

  it('ignores a response with another requestId', async () => {
    const transport = new FakeTransport();
    const converter = new HostMessageUriConverter(transport);

    const pending = converter.readBinary(uriForId('1'));
    const request = transport.lastRequest();

    converter.handleMessage({
      type: 'typemf/getObjectResult',
      requestId: 'some-other-request',
      snapshot: { id: '999', eClassId: 'ecore:1', attributes: {}, references: {} },
    });
    converter.handleMessage({
      type: 'typemf/getObjectResult',
      requestId: request.requestId,
      snapshot: { id: '1', eClassId: 'ecore:1', attributes: {}, references: {} },
    });

    const bytes = await pending;
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    expect(decoded.id).toBe('1'); // the real one, not the unrelated one that was ignored
  });

  it('resolves concurrent readBinary calls independently', async () => {
    const transport = new FakeTransport();
    const converter = new HostMessageUriConverter(transport);

    const pendingA = converter.readBinary(uriForId('a'));
    const requestA = transport.lastRequest();
    const pendingB = converter.readBinary(uriForId('b'));
    const requestB = transport.sent.filter(isGetObjectRequest).find((r) => r.id === 'b')!;

    converter.handleMessage({
      type: 'typemf/getObjectResult',
      requestId: requestB.requestId,
      snapshot: { id: 'b', eClassId: 'ecore:1', attributes: {}, references: {} },
    });
    converter.handleMessage({
      type: 'typemf/getObjectResult',
      requestId: requestA.requestId,
      snapshot: { id: 'a', eClassId: 'ecore:1', attributes: {}, references: {} },
    });

    const [decodedA, decodedB] = await Promise.all(
      [pendingA, pendingB].map(async (p) => JSON.parse(new TextDecoder().decode(await p)))
    );
    expect(decodedA.id).toBe('a');
    expect(decodedB.id).toBe('b');
  });

  it('writeBinary is not supported', async () => {
    const converter = new HostMessageUriConverter(new FakeTransport());
    await expect(converter.writeBinary()).rejects.toThrow();
  });

  it('handleMessage ignores unrelated message types', () => {
    const converter = new HostMessageUriConverter(new FakeTransport());
    expect(() => converter.handleMessage({ type: 'something/unrelated' })).not.toThrow();
    expect(() => converter.handleMessage(null)).not.toThrow();
    expect(() => converter.handleMessage('not even an object')).not.toThrow();
  });
});
