import { EPackage } from '@typemf/core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { GeneratorConfig } from './cli-config.js';
import { generate } from './generate.js';
import { resolveTemplateSet } from './template-set-registry.js';

export interface RunGenerationResult {
  writtenPaths: string[];
  outputRoot: string;
}

/**
 * `configDir` is the directory the config file itself lives in -
 * `config.outputDir` resolves relative to THAT, not the process's current
 * working directory, so a config file behaves identically regardless of
 * where the CLI happens to be invoked from.
 */
export async function runGeneration(
  config: GeneratorConfig,
  configDir: string,
  pkg: EPackage
): Promise<RunGenerationResult> {
  const templateSet = resolveTemplateSet(config.templateSet);
  const files = generate(pkg, templateSet, config.options);

  const outputRoot = resolve(configDir, config.outputDir);
  const writtenPaths: string[] = [];
  for (const file of files) {
    const fullPath = join(outputRoot, file.path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file.content, 'utf-8');
    writtenPaths.push(fullPath);
  }

  return { writtenPaths, outputRoot };
}
