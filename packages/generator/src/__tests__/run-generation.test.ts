import { readFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runGeneration } from '../run-generation.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('runGeneration', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-rungen-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes files to outputDir, relative to the config file', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    const configDir = join(dir, 'some', 'nested', 'project');
    await mkdir(configDir, { recursive: true });

    const result = await runGeneration(
      { ecoreFile: './model.ecore', outputDir: './generated', templateSet: 'typescript', options: {} },
      configDir,
      libraryPackage
    );

    expect(result.outputRoot).toBe(join(configDir, 'generated'));
    expect(result.writtenPaths.length).toBeGreaterThan(0);
    expect(result.writtenPaths).toContain(join(configDir, 'generated', 'LibraryPackage.ts'));

    const bookTypesContent = await readFile(join(configDir, 'generated', 'types', 'Book.ts'), 'utf-8');
    expect(bookTypesContent).toContain('export interface Book extends EObject');
  });

  it('creates intermediate directories that do not exist yet', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    const configDir = join(dir, 'proj');
    await mkdir(configDir, { recursive: true });

    const result = await runGeneration(
      { ecoreFile: './model.ecore', outputDir: './deeply/nested/output', templateSet: 'typescript', options: {} },
      configDir,
      libraryPackage
    );

    const content = await readFile(join(result.outputRoot, 'impl', 'LibraryFactoryImpl.ts'), 'utf-8');
    expect(content).toContain('export class LibraryFactoryImpl');
  });

  it('passes options through to the templates', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    const configDir = join(dir, 'proj2');
    await mkdir(configDir, { recursive: true });

    const result = await runGeneration(
      { ecoreFile: './m.ecore', outputDir: './out', templateSet: 'typescript', options: { unused: 'value' } },
      configDir,
      libraryPackage
    );
    expect(result.writtenPaths.length).toBeGreaterThan(0);
  });

  it('throws for an unknown template set', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    await expect(
      runGeneration(
        { ecoreFile: './m.ecore', outputDir: './out', templateSet: 'java', options: {} },
        dir,
        libraryPackage
      )
    ).rejects.toThrow(/Unknown template set 'java'/);
  });
});
