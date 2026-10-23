import { describe, expect, it } from 'vitest';
import { validateOptions } from '../options-validation.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

describe('validateOptions', () => {
  it('accepts the options of the typescript set', () => {
    expect(
      validateOptions(typescriptTemplateSet, {
        'generate-ecore': true,
        'package-imports': { 'https://example.com/shapes': '../shapes' },
        'type-imports': { 'https://example.com/shapes#Color': { type: 'Color', from: 'color-lib' } },
      })
    ).toEqual([]);
  });

  it('names the option that has the wrong type', () => {
    expect(validateOptions(typescriptTemplateSet, { 'generate-ecore': 'yes' })).toEqual([
      'options.generate-ecore: must be boolean',
    ]);
  });

  it('names a nested problem and an unknown option', () => {
    const problems = validateOptions(typescriptTemplateSet, {
      'type-imports': { 'urn:x#T': { type: 1 } },
      other: true,
    });
    expect(problems).toContain('options.type-imports.urn:x#T.type: must be string');
    expect(problems).toContain("options: must NOT have additional properties 'other'");
  });

  it('accepts anything for a set without a schema', () => {
    expect(validateOptions({ name: 'x', baseFolder: '/x' }, { anything: 1 })).toEqual([]);
  });
});
