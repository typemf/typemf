import { Ajv } from 'ajv';
import { describe, expect, it } from 'vitest';
import { generatorConfigSchema } from '../config-schema.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

describe('generatorConfigSchema', () => {
  const validate = new Ajv({ strict: false }).compile(generatorConfigSchema([typescriptTemplateSet]));
  const config = { ecoreFile: './m.ecore', outputDir: './out', templateSet: 'typescript' };

  it('accepts a config with the options of its template set', () => {
    expect(validate({ ...config, options: { 'generate-ecore': true } })).toBe(true);
  });

  it('rejects options the named template set does not know', () => {
    expect(validate({ ...config, options: { nope: 1 } })).toBe(false);
  });

  it('leaves the options of a template set without a schema alone', () => {
    expect(validate({ ...config, templateSet: 'java', options: { nope: 1 } })).toBe(true);
  });

  it('requires the three fields', () => {
    expect(validate({ ecoreFile: './m.ecore' })).toBe(false);
  });
});
