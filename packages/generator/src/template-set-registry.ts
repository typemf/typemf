import { TemplateSet } from './template-set.js';
import { typescriptTemplateSet } from './typescript-template-set.js';

const templateSets = new Map<string, TemplateSet>([[typescriptTemplateSet.name, typescriptTemplateSet]]);

/**
 * Adds a template set under its name, for the whole process. A name that is taken throws, unless
 * `replace` is set.
 */
export function registerTemplateSet(templateSet: TemplateSet, options: { replace?: boolean } = {}): void {
  if (templateSets.has(templateSet.name) && !options.replace) {
    throw new Error(`A template set named '${templateSet.name}' is already registered.`);
  }
  templateSets.set(templateSet.name, templateSet);
}

/** Removes a template set, for example one that was loaded from a package that is no longer wanted. */
export function unregisterTemplateSet(name: string): void {
  templateSets.delete(name);
}

/** All registered template sets, the built-in one first. */
export function listTemplateSets(): TemplateSet[] {
  return [...templateSets.values()];
}

/** Resolves the `templateSet` name of a config file to a registered TemplateSet. */
export function resolveTemplateSet(name: string): TemplateSet {
  const set = templateSets.get(name);
  if (!set) {
    const known = [...templateSets.keys()].join(', ');
    throw new Error(`Unknown template set '${name}'. Known template sets: ${known}.`);
  }
  return set;
}
