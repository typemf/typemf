import { describe, expect, it } from 'vitest';
import { ConcreteSubtypesQuery } from '../concrete-subtypes-query.js';
import { ConcreteSubtypesRequest, isConcreteSubtypesRequest } from '../host-message-protocol.js';
import { PostMessageTransport } from '../host-message-uri-converter.js';

class FakeTransport implements PostMessageTransport {
  readonly sent: unknown[] = [];
  postMessage(message: unknown): void {
    this.sent.push(message);
  }
  lastRequest(): ConcreteSubtypesRequest {
    const request = [...this.sent].reverse().find(isConcreteSubtypesRequest);
    if (!request) throw new Error('no ConcreteSubtypesRequest was ever sent');
    return request;
  }
}

describe('ConcreteSubtypesQuery', () => {
  it('sends a ConcreteSubtypesRequest and resolves with the classes of the matching response', async () => {
    const transport = new FakeTransport();
    const query = new ConcreteSubtypesQuery(transport);

    const pending = query.query('shape-class-id');
    const request = transport.lastRequest();
    expect(request.classId).toBe('shape-class-id');

    query.handleMessage({
      type: 'typemf/concreteSubtypesResult',
      requestId: request.requestId,
      classIds: ['circle-id', 'square-id'],
    });

    expect(await pending).toEqual(['circle-id', 'square-id']);
  });

  it('rejects when a matching ConcreteSubtypesError arrives instead', async () => {
    const transport = new FakeTransport();
    const query = new ConcreteSubtypesQuery(transport);

    const pending = query.query('unknown-class');
    const request = transport.lastRequest();
    query.handleMessage({
      type: 'typemf/concreteSubtypesError',
      requestId: request.requestId,
      message: 'no class known',
    });

    await expect(pending).rejects.toThrow('no class known');
  });

  it('ignores a response with another requestId', async () => {
    const transport = new FakeTransport();
    const query = new ConcreteSubtypesQuery(transport);

    const pending = query.query('shape-class-id');
    const request = transport.lastRequest();

    query.handleMessage({ type: 'typemf/concreteSubtypesResult', requestId: 'unrelated', classIds: ['wrong'] });
    query.handleMessage({ type: 'typemf/concreteSubtypesResult', requestId: request.requestId, classIds: ['right'] });

    expect(await pending).toEqual(['right']);
  });

  it('handleMessage ignores unrelated message types', () => {
    const query = new ConcreteSubtypesQuery(new FakeTransport());
    expect(() => query.handleMessage({ type: 'something/else' })).not.toThrow();
    expect(() => query.handleMessage(null)).not.toThrow();
  });
});
