import { Ajv } from 'ajv';
import { TemplateSet } from './template-set.js';

const ajv = new Ajv({ allErrors: true, strict: false });

/**
 * The problems of `options` against the options schema of `templateSet`, one line each. Empty when
 * the options are fine, or when the set has no schema.
 */
export function validateOptions(templateSet: TemplateSet, options: Record<string, unknown>): string[] {
  if (!templateSet.optionsSchema) return [];
  const validate = ajv.compile(templateSet.optionsSchema);
  if (validate(options)) return [];
  return (validate.errors ?? []).map((error) => {
    const where = error.instancePath === '' ? 'options' : `options${error.instancePath.replace(/\//g, '.')}`;
    const extra =
      error.keyword === 'additionalProperties'
        ? ` '${(error.params as { additionalProperty: string }).additionalProperty}'`
        : '';
    return `${where}: ${error.message}${extra}`;
  });
}
