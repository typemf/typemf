import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadConfig } from '../cli-config.js';

describe('loadConfig', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-config-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('loads a valid config with defaults for options', async () => {
    const configPath = join(dir, 'config.json');
    await writeFile(
      configPath,
      JSON.stringify({ ecoreFile: './model.ecore', outputDir: './out', templateSet: 'typescript' })
    );

    const config = await loadConfig(configPath);
    expect(config).toEqual({
      ecoreFile: './model.ecore',
      outputDir: './out',
      templateSet: 'typescript',
      options: {},
    });
  });

  it('loads options when present', async () => {
    const configPath = join(dir, 'config.json');
    await writeFile(
      configPath,
      JSON.stringify({
        ecoreFile: './model.ecore',
        outputDir: './out',
        templateSet: 'typescript',
        options: { targetVersion: 'es2022' },
      })
    );

    const config = await loadConfig(configPath);
    expect(config.options).toEqual({ targetVersion: 'es2022' });
  });

  it('throws a clear error for a missing file', async () => {
    await expect(loadConfig(join(dir, 'does-not-exist.json'))).rejects.toThrow(/Could not read config file/);
  });

  it('throws a clear error for invalid JSON', async () => {
    const configPath = join(dir, 'config.json');
    await writeFile(configPath, '{not valid json');
    await expect(loadConfig(configPath)).rejects.toThrow(/Failed to parse/);
  });

  it('throws a clear error when a required field is missing', async () => {
    const configPath = join(dir, 'config.json');
    await writeFile(configPath, JSON.stringify({ ecoreFile: './model.ecore', outputDir: './out' }));
    await expect(loadConfig(configPath)).rejects.toThrow(/"templateSet" is required/);
  });

  it('throws a clear error when a required field is the wrong type', async () => {
    const configPath = join(dir, 'config.json');
    await writeFile(configPath, JSON.stringify({ ecoreFile: 42, outputDir: './out', templateSet: 'typescript' }));
    await expect(loadConfig(configPath)).rejects.toThrow(/"ecoreFile" is required/);
  });

  it('throws a clear error when options is not an object', async () => {
    const configPath = join(dir, 'config.json');
    await writeFile(
      configPath,
      JSON.stringify({ ecoreFile: './m.ecore', outputDir: './out', templateSet: 'typescript', options: 'nope' })
    );
    await expect(loadConfig(configPath)).rejects.toThrow(/"options", if present, must be a JSON object/);
  });

  it('throws a clear error when the config is not a JSON object at all', async () => {
    const configPath = join(dir, 'config.json');
    await writeFile(configPath, JSON.stringify(['not', 'an', 'object']));
    await expect(loadConfig(configPath)).rejects.toThrow(/must contain a JSON object/);
  });
});
