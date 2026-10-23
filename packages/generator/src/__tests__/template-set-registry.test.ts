import { afterEach, describe, expect, it } from 'vitest';
import {
  listTemplateSets,
  registerTemplateSet,
  resolveTemplateSet,
  unregisterTemplateSet,
} from '../template-set-registry.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

describe('template set registry', () => {
  afterEach(() => unregisterTemplateSet('java'));

  it('resolves the built-in "typescript" set', () => {
    expect(resolveTemplateSet('typescript')).toBe(typescriptTemplateSet);
  });

  it('throws naming the known sets for an unknown name', () => {
    expect(() => resolveTemplateSet('java')).toThrow(/Unknown template set 'java'.*typescript/);
  });

  it('resolves and lists a registered set', () => {
    const java = { name: 'java', baseFolder: '/somewhere' };
    registerTemplateSet(java);
    expect(resolveTemplateSet('java')).toBe(java);
    expect(listTemplateSets().map((set) => set.name)).toEqual(['typescript', 'java']);
  });

  it('refuses a taken name unless asked to replace it', () => {
    registerTemplateSet({ name: 'java', baseFolder: '/a' });
    expect(() => registerTemplateSet({ name: 'java', baseFolder: '/b' })).toThrow(/already registered/);
    registerTemplateSet({ name: 'java', baseFolder: '/b' }, { replace: true });
    expect(resolveTemplateSet('java').baseFolder).toBe('/b');
  });
});
