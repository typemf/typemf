import { TemplateSet } from './template-set.js';
import { typescriptTemplateSet } from './typescript-template-set.js';

const builtinTemplateSets: Record<string, TemplateSet> = {
  typescript: typescriptTemplateSet,
};

/**
 * Resolves a config file's "templateSet" name string to a real
 * TemplateSet. Only built-in sets are known here for now - a third-party
 * set (e.g. a Java one) would need its own registration mechanism, not yet
 * built; see NOTES.md.
 */
export function resolveTemplateSet(name: string): TemplateSet {
  const set = builtinTemplateSets[name];
  if (!set) {
    const known = Object.keys(builtinTemplateSets).join(', ');
    throw new Error(`Unknown template set '${name}'. Known built-in sets: ${known}.`);
  }
  return set;
}
