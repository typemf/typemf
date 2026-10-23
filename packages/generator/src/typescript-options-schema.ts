import type { JsonSchema } from './template-set.js';

/**
 * The options of the `typescript` template set. `x-typemf-key` tells the editor what the keys of a
 * map are, so it can offer them from the loaded packages instead of asking for free text.
 */
export const typescriptOptionsSchema: JsonSchema = {
  type: 'object',
  properties: {
    'generate-ecore': {
      type: 'boolean',
      description: 'The package is Ecore itself: generate the metamodel of @typemf/core.',
    },
    'package-imports': {
      type: 'object',
      description:
        'Where the generated code of another package is, by nsURI. A value starting with "./" or "../" is a folder ' +
        'relative to the output directory; any other value is a module name that exports the types and the PackageImpl.',
      'x-typemf-key': 'nsURI',
      additionalProperties: { type: 'string', minLength: 1 },
    },
    'type-imports': {
      type: 'object',
      description:
        'Which symbol to import for a data type, keyed "<nsURI>#<classifier name>". Overrides the import ' +
        'annotation of the data type.',
      'x-typemf-key': 'classifier',
      additionalProperties: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'The symbol to import.' },
          from: { type: 'string', description: 'The module other packages import it from.' },
          'internal-from': {
            type: 'string',
            description: 'Where the generated package imports it from, relative to its root when starting with "./".',
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};
