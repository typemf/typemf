import { selectTemplateSets, typescriptTemplateSet, validateOptions } from '@typemf/generator';
import type { JsonObject, TemplateSetView } from './protocol.js';

export interface TemplateSetViews {
  views: TemplateSetView[];
  problems: string[];
}

/** The built-in template set and those found around `configDir`, without running any package code. */
export async function loadTemplateSetViews(configDir: string, explicitPackages: string[]): Promise<TemplateSetViews> {
  const byName = new Map<string, TemplateSetView>([
    [
      typescriptTemplateSet.name,
      {
        name: typescriptTemplateSet.name,
        description: typescriptTemplateSet.description,
        optionsSchema: typescriptTemplateSet.optionsSchema,
        origin: 'built-in',
        runsCode: false,
      },
    ],
  ]);
  const problems: string[] = [];
  try {
    for (const info of await selectTemplateSets(configDir, { explicitPackages })) {
      if (byName.has(info.name) && info.source !== 'explicit') {
        problems.push(`The template set '${info.name}' of ${info.packageName} is hidden by a built-in set.`);
        continue;
      }
      byName.set(info.name, {
        name: info.name,
        description: info.description,
        optionsSchema: info.optionsSchema,
        origin: info.packageName,
        runsCode: info.modulePath !== undefined,
      });
    }
  } catch (err) {
    problems.push((err as Error).message);
  }
  const views = [...byName.values()];
  return { views, problems };
}

/** The problems of `options` against the options schema of the template set named `templateSet`. */
export function optionProblems(views: TemplateSetView[], templateSet: unknown, options: unknown): string[] {
  const view = views.find((candidate) => candidate.name === templateSet);
  if (!view?.optionsSchema) return [];
  if (options === undefined) return [];
  if (typeof options !== 'object' || options === null || Array.isArray(options)) return ['options: must be an object'];
  return validateOptions({ name: view.name, baseFolder: '', optionsSchema: view.optionsSchema }, options as JsonObject);
}
