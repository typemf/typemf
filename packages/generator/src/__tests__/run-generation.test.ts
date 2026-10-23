import { readFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { findOverwrittenFiles, planGeneration, runGeneration } from '../run-generation.js';
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
      { ecoreFile: './m.ecore', outputDir: './out', templateSet: 'typescript', options: { 'generate-ecore': false } },
      configDir,
      libraryPackage
    );
    expect(result.writtenPaths.length).toBeGreaterThan(0);
  });

  it('rejects options the template set does not know', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    await expect(
      runGeneration(
        { ecoreFile: './m.ecore', outputDir: './out', templateSet: 'typescript', options: { unused: 'value' } },
        dir,
        libraryPackage
      )
    ).rejects.toThrow(
      /Invalid options for template set 'typescript'.*options: must NOT have additional properties 'unused'/s
    );
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

  it('plans the files with absolute paths without writing them', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    const plan = planGeneration(
      { ecoreFile: './m.ecore', outputDir: './out', templateSet: 'typescript', options: {} },
      dir,
      libraryPackage
    );

    expect(plan.outputRoot).toBe(join(dir, 'out'));
    expect(plan.files.map((f) => f.path)).toContain(join(dir, 'out', 'LibraryPackage.ts'));
    await expect(readFile(join(dir, 'out', 'LibraryPackage.ts'), 'utf-8')).rejects.toThrow(/ENOENT/);
  });

  it('finds the files that exist with other content', async () => {
    await mkdir(join(dir, 'out'), { recursive: true });
    await writeFile(join(dir, 'out', 'same.ts'), 'a');
    await writeFile(join(dir, 'out', 'different.ts'), 'old');

    const overwritten = await findOverwrittenFiles([
      { path: join(dir, 'out', 'same.ts'), content: 'a' },
      { path: join(dir, 'out', 'different.ts'), content: 'new' },
      { path: join(dir, 'out', 'missing.ts'), content: 'b' },
    ]);
    expect(overwritten).toEqual([join(dir, 'out', 'different.ts')]);
  });
});
