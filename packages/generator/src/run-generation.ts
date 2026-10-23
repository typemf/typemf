import { EPackage } from '@typemf/core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { GeneratorConfig } from './cli-config.js';
import { generate } from './generate.js';
import { GeneratedFile } from './generated-file.js';
import { validateOptions } from './options-validation.js';
import { resolveTemplateSet } from './template-set-registry.js';

export interface GenerationPlan {
  /** Where the files go: `config.outputDir`, resolved against the config file's directory. */
  outputRoot: string;
  /** The files to write, with absolute paths. */
  files: GeneratedFile[];
}

export interface RunGenerationResult {
  writtenPaths: string[];
  outputRoot: string;
}

/**
 * Renders the files a config produces for `pkg`, without writing anything.
 *
 * `configDir` is the directory the config file itself lives in -
 * `config.outputDir` resolves relative to THAT, not the process's current
 * working directory, so a config file behaves identically regardless of
 * where the CLI happens to be invoked from.
 */
export function planGeneration(config: GeneratorConfig, configDir: string, pkg: EPackage): GenerationPlan {
  const templateSet = resolveTemplateSet(config.templateSet);
  const problems = validateOptions(templateSet, config.options);
  if (problems.length > 0) {
    throw new Error(
      `Invalid options for template set '${templateSet.name}':\n` + problems.map((p) => `  - ${p}`).join('\n')
    );
  }
  const outputRoot = resolve(configDir, config.outputDir);
  const files = generate(pkg, templateSet, config.options).map((file) => ({
    path: join(outputRoot, file.path),
    content: file.content,
  }));
  return { outputRoot, files };
}

/** The paths of `files` that exist and have other content - the files writing them would change. */
export async function findOverwrittenFiles(files: GeneratedFile[]): Promise<string[]> {
  const overwritten: string[] = [];
  for (const file of files) {
    try {
      if ((await readFile(file.path, 'utf-8')) !== file.content) overwritten.push(file.path);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }
  return overwritten;
}

/** Writes files with absolute paths, creating folders as needed. Returns the paths written. */
export async function writeGeneratedFiles(files: GeneratedFile[]): Promise<string[]> {
  for (const file of files) {
    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.content, 'utf-8');
  }
  return files.map((file) => file.path);
}

export async function runGeneration(
  config: GeneratorConfig,
  configDir: string,
  pkg: EPackage
): Promise<RunGenerationResult> {
  const { outputRoot, files } = planGeneration(config, configDir, pkg);
  return { writtenPaths: await writeGeneratedFiles(files), outputRoot };
}
