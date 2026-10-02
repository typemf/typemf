import { describe, expect, it } from 'vitest';
import { resolveTemplateSet } from '../template-set-registry.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

describe('resolveTemplateSet', () => {
  it('resolves the built-in "typescript" set', () => {
    expect(resolveTemplateSet('typescript')).toBe(typescriptTemplateSet);
  });

  it('throws naming the known sets for an unknown name', () => {
    expect(() => resolveTemplateSet('java')).toThrow(/Unknown template set 'java'.*typescript/);
  });
});
