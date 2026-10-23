import { JsonSchema, TemplateSet } from './template-set.js';

/**
 * The JSON Schema of a generator config file. `options` is checked against the schema of the
 * template set that `templateSet` names, for every set in `templateSets` that has one.
 */
export function generatorConfigSchema(templateSets: TemplateSet[]): JsonSchema {
  const withSchema = templateSets.filter((set) => set.optionsSchema !== undefined);
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'TypeMF generator config',
    type: 'object',
    required: ['ecoreFile', 'outputDir', 'templateSet'],
    properties: {
      $schema: { type: 'string' },
      ecoreFile: { type: 'string', minLength: 1, description: 'The .ecore file, relative to this file.' },
      outputDir: { type: 'string', minLength: 1, description: 'Where the generated files go, relative to this file.' },
      templateSet: {
        type: 'string',
        minLength: 1,
        description: 'The template set to generate with.',
        ...(templateSets.length > 0 ? { examples: templateSets.map((set) => set.name) } : {}),
      },
      options: { type: 'object', description: 'Options of the template set.' },
    },
    additionalProperties: false,
    allOf: withSchema.map((set) => ({
      if: { properties: { templateSet: { const: set.name } }, required: ['templateSet'] },
      then: { properties: { options: set.optionsSchema } },
    })),
  };
}
