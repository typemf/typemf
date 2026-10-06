import { describe, expect, it } from 'vitest';
import { resolveDocumentIdentity } from '../resolve-document-identity.js';

describe('resolveDocumentIdentity', () => {
  it('uses a file URI for a real file, regardless of the string passed for uriStringWithoutFragment', () => {
    const identity = resolveDocumentIdentity('file', '/tmp/library.xmi', 'untitled:ignored');
    expect(identity.toString()).toBe('file:///tmp/library.xmi');
  });

  it('uses the given uri string (fragment already stripped) for an untitled document', () => {
    const identity = resolveDocumentIdentity('untitled', '/Untitled-1', 'untitled:Untitled-1');
    expect(identity.toString()).toBe('untitled:Untitled-1');
  });
});
