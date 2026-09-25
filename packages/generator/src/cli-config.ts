import { readFile } from 'node:fs/promises';

/**
 * One config, one template set, one .ecore file, one outputDir - per the
 * design discussion. Multi-language generation is achieved by running the
 * CLI multiple times with different config files (e.g.
 * typescript.typemf-generator.json, java.typemf-generator.json), not by
 * one config handling multiple sets.
 */
export interface GeneratorConfig {
  ecoreFile: string;
  outputDir: string;
  templateSet: string;
  options: Record<string, unknown>;
}

export async function loadConfig(configPath: string): Promise<GeneratorConfig> {
  let raw: string;
  try {
    raw = await readFile(configPath, 'utf-8');
  } catch (err) {
    throw new Error(`Could not read config file '${configPath}': ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse '${configPath}' as JSON: ${(err as Error).message}`);
  }

  return validateConfig(parsed, configPath);
}

function validateConfig(value: unknown, configPath: string): GeneratorConfig {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`'${configPath}' must contain a JSON object.`);
  }
  const obj = value as Record<string, unknown>;

  for (const key of ['ecoreFile', 'outputDir', 'templateSet']) {
    if (typeof obj[key] !== 'string' || obj[key] === '') {
      throw new Error(`'${configPath}': "${key}" is required and must be a non-empty string.`);
    }
  }

  if (obj.options !== undefined && (typeof obj.options !== 'object' || obj.options === null || Array.isArray(obj.options))) {
    throw new Error(`'${configPath}': "options", if present, must be a JSON object.`);
  }

  return {
    ecoreFile: obj.ecoreFile as string,
    outputDir: obj.outputDir as string,
    templateSet: obj.templateSet as string,
    options: (obj.options as Record<string, unknown> | undefined) ?? {},
  };
}
