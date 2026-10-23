import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateFromConfig, summarizeEcoreFile } from '../../generator-editor/generation.js';
import { loadTemplateSetViews, optionProblems } from '../../generator-editor/template-set-views.js';

const ECORE = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="shapes" nsURI="https://typemf.dev/test/shapes" nsPrefix="shp">
  <eClassifiers xsi:type="ecore:EClass" name="Shape"/>
</ecore:EPackage>
`;

describe('generator editor', () => {
  let dir: string;
  let configPath: string;
  const configText = JSON.stringify({
    ecoreFile: './shapes.ecore',
    outputDir: './out',
    templateSet: 'typescript',
    options: {},
  });

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-generator-editor-'));
    configPath = join(dir, 'shapes.typemf-generator.json');
    await writeFile(join(dir, 'shapes.ecore'), ECORE);
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  const request = (overrides = {}) => ({
    configPath,
    configText,
    explicitPackages: [],
    trusted: true,
    confirmOverwrite: async () => true,
    ...overrides,
  });

  describe('generateFromConfig', () => {
    it('writes the files and reports them relative to the output folder', async () => {
      const outcome = await generateFromConfig(request());
      expect(outcome.status).toBe('done');
      if (outcome.status !== 'done') return;
      expect(outcome.outputRoot).toBe(join(dir, 'out'));
      expect(outcome.files).toContain('types/Shape.ts');
      expect(await readFile(join(dir, 'out', 'types', 'Shape.ts'), 'utf-8')).toContain('interface Shape');
    });

    it('does not ask when nothing would be overwritten, and asks about changed files only', async () => {
      const asked: string[][] = [];
      const confirmOverwrite = async (paths: string[]) => {
        asked.push(paths);
        return true;
      };
      await generateFromConfig(request({ confirmOverwrite }));
      await generateFromConfig(request({ confirmOverwrite }));
      expect(asked).toEqual([]);

      await writeFile(join(dir, 'out', 'types', 'Shape.ts'), 'changed');
      await generateFromConfig(request({ confirmOverwrite }));
      expect(asked).toEqual([[join(dir, 'out', 'types', 'Shape.ts')]]);
    });

    it('writes nothing when the overwrite is refused', async () => {
      await mkdir(join(dir, 'out', 'types'), { recursive: true });
      await writeFile(join(dir, 'out', 'types', 'Shape.ts'), 'mine');

      const outcome = await generateFromConfig(request({ confirmOverwrite: async () => false }));
      expect(outcome).toEqual({ status: 'cancelled' });
      expect(await readFile(join(dir, 'out', 'types', 'Shape.ts'), 'utf-8')).toBe('mine');
    });

    it('fails for options the template set does not know', async () => {
      const text = JSON.stringify({ ...JSON.parse(configText), options: { nope: true } });
      await expect(generateFromConfig(request({ configText: text }))).rejects.toThrow(/Invalid options/);
    });

    it('fails for a template set that is not there', async () => {
      const text = JSON.stringify({ ...JSON.parse(configText), templateSet: 'java' });
      await expect(generateFromConfig(request({ configText: text }))).rejects.toThrow(/Unknown template set 'java'/);
    });

    it('refuses a template set with a hooks module in an untrusted workspace', async () => {
      const pkg = join(dir, 'java-pkg');
      await mkdir(join(pkg, 'templates'), { recursive: true });
      await writeFile(join(pkg, 'templates', 'main.njk'), '');
      await writeFile(join(pkg, 'hooks.mjs'), 'export const validate = () => [];');
      await writeFile(
        join(pkg, 'package.json'),
        JSON.stringify({
          name: 'java-pkg',
          typemf: { templateSets: [{ name: 'java', templates: './templates', module: './hooks.mjs' }] },
        })
      );
      const text = JSON.stringify({ ...JSON.parse(configText), templateSet: 'java' });

      await expect(
        generateFromConfig(request({ configText: text, explicitPackages: [pkg], trusted: false }))
      ).rejects.toThrow(/needs a trusted workspace/);
    });
  });

  describe('summarizeEcoreFile', () => {
    it('summarizes the model', async () => {
      expect(await summarizeEcoreFile(dir, './shapes.ecore')).toMatchObject({
        name: 'shapes',
        nsURI: 'https://typemf.dev/test/shapes',
      });
    });
  });

  describe('template set views', () => {
    it('lists the built-in set with its options schema', async () => {
      const { views, problems } = await loadTemplateSetViews(dir, []);
      expect(problems).toEqual([]);
      expect(views.map((view) => view.name)).toEqual(['typescript']);
      expect(views[0]?.optionsSchema).toBeDefined();
    });

    it('reports the problems of the options against the schema of the chosen set', async () => {
      const { views } = await loadTemplateSetViews(dir, []);
      expect(optionProblems(views, 'typescript', { 'generate-ecore': 1 })).toEqual([
        'options.generate-ecore: must be boolean',
      ]);
      expect(optionProblems(views, 'typescript', undefined)).toEqual([]);
      expect(optionProblems(views, 'unknown', { anything: 1 })).toEqual([]);
    });
  });
});
