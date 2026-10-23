import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  discoverTemplateSets,
  loadTemplateSet,
  readTemplateSetPackage,
  registerTemplateSets,
} from '../template-set-packages.js';
import { listTemplateSets, resolveTemplateSet, unregisterTemplateSet } from '../template-set-registry.js';

let root: string;

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, JSON.stringify(value));
}

/** A package at `dir` that declares one template set called `name`. */
async function templateSetPackage(dir: string, packageName: string, name: string, extra = {}): Promise<void> {
  await writeJson(join(dir, 'package.json'), {
    name: packageName,
    typemf: { templateSets: [{ name, description: `${name} code`, templates: './templates', ...extra }] },
  });
  await mkdir(join(dir, 'templates'), { recursive: true });
  await writeFile(join(dir, 'templates', 'main.njk'), '');
}

/** A project whose package.json depends on the given packages, installed in its node_modules. */
async function project(dir: string, dependencies: Record<string, string>): Promise<void> {
  await writeJson(join(dir, 'package.json'), {
    name: 'project',
    dependencies: Object.fromEntries(Object.keys(dependencies).map((n) => [n, '*'])),
  });
  for (const [name, source] of Object.entries(dependencies)) {
    await mkdir(join(dir, 'node_modules', ...name.split('/').slice(0, -1)), { recursive: true });
    await symlink(source, join(dir, 'node_modules', name));
  }
}

describe('template set packages', () => {
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'typemf-template-sets-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
    for (const name of ['java', 'cpp']) unregisterTemplateSet(name);
  });

  describe('readTemplateSetPackage', () => {
    it('reads the declaration, the options schema and the module path', async () => {
      const dir = join(root, 'java-pkg');
      await templateSetPackage(dir, 'java-pkg', 'java', { optionsSchema: './options.json', module: './hooks.mjs' });
      await writeJson(join(dir, 'options.json'), { type: 'object' });
      await writeFile(join(dir, 'hooks.mjs'), 'export function validate() { return []; }');

      const [info] = await readTemplateSetPackage(dir);
      expect(info).toMatchObject({
        name: 'java',
        description: 'java code',
        packageName: 'java-pkg',
        baseFolder: join(dir, 'templates'),
        optionsSchema: { type: 'object' },
        modulePath: join(dir, 'hooks.mjs'),
      });
    });

    it('finds no template sets in a package without the field', async () => {
      await writeJson(join(root, 'package.json'), { name: 'plain' });
      expect(await readTemplateSetPackage(root)).toEqual([]);
    });

    it('rejects a declaration without main.njk', async () => {
      const dir = join(root, 'broken');
      await writeJson(join(dir, 'package.json'), {
        name: 'broken',
        typemf: { templateSets: [{ name: 'x', templates: './t' }] },
      });
      await expect(readTemplateSetPackage(dir)).rejects.toThrow(/broken: template set 'x': '.\/t' has no main.njk/);
    });

    it('rejects a declaration without a name', async () => {
      const dir = join(root, 'nameless');
      await writeJson(join(dir, 'package.json'), {
        name: 'nameless',
        typemf: { templateSets: [{ templates: './t' }] },
      });
      await expect(readTemplateSetPackage(dir)).rejects.toThrow(/needs a "name" string/);
    });
  });

  describe('discoverTemplateSets', () => {
    it('finds the sets of dependencies, including scoped packages, from a nested folder', async () => {
      await templateSetPackage(join(root, 'store', 'java-pkg'), 'java-pkg', 'java');
      await templateSetPackage(join(root, 'store', 'cpp-pkg'), '@acme/cpp-pkg', 'cpp');
      await project(join(root, 'proj'), {
        'java-pkg': join(root, 'store', 'java-pkg'),
        '@acme/cpp-pkg': join(root, 'store', 'cpp-pkg'),
      });
      await mkdir(join(root, 'proj', 'models'), { recursive: true });

      const found = await discoverTemplateSets(join(root, 'proj', 'models'));
      expect(found.map((info) => info.name).sort()).toEqual(['cpp', 'java']);
    });

    it('skips dependencies that are not installed or declare nothing', async () => {
      await writeJson(join(root, 'proj', 'package.json'), { dependencies: { missing: '*' } });
      expect(await discoverTemplateSets(join(root, 'proj'))).toEqual([]);
    });

    it('finds nothing without a package.json', async () => {
      expect(await discoverTemplateSets(join(root, 'nowhere'))).toEqual([]);
    });
  });

  describe('loadTemplateSet', () => {
    it('takes the hooks from the module', async () => {
      const dir = join(root, 'hooked');
      await templateSetPackage(dir, 'hooked', 'java', { module: './hooks.mjs' });
      await writeFile(join(dir, 'hooks.mjs'), "export function validate() { return ['no']; }");

      const [info] = await readTemplateSetPackage(dir);
      const set = await loadTemplateSet(info!);
      expect(set.validate?.({} as never, {})).toEqual(['no']);
      expect(set.postProcessFile).toBeUndefined();
    });

    it('rejects a hook that is not a function', async () => {
      const dir = join(root, 'bad-hook');
      await templateSetPackage(dir, 'bad-hook', 'java', { module: './hooks.mjs' });
      await writeFile(join(dir, 'hooks.mjs'), 'export const validate = 1;');

      const [info] = await readTemplateSetPackage(dir);
      await expect(loadTemplateSet(info!)).rejects.toThrow(/"validate" of the module must be a function/);
    });
  });

  describe('registerTemplateSets', () => {
    it('registers discovered sets', async () => {
      await templateSetPackage(join(root, 'store', 'java-pkg'), 'java-pkg', 'java');
      await project(join(root, 'proj'), { 'java-pkg': join(root, 'store', 'java-pkg') });

      await registerTemplateSets(join(root, 'proj'));
      expect(resolveTemplateSet('java').baseFolder).toBe(join(root, 'store', 'java-pkg', 'templates'));
    });

    it('does not discover with discover: false', async () => {
      await templateSetPackage(join(root, 'store', 'java-pkg'), 'java-pkg', 'java');
      await project(join(root, 'proj'), { 'java-pkg': join(root, 'store', 'java-pkg') });

      await registerTemplateSets(join(root, 'proj'), { discover: false });
      expect(listTemplateSets().map((set) => set.name)).not.toContain('java');
    });

    it('reports two discovered packages with the same set name, naming both', async () => {
      await templateSetPackage(join(root, 'store', 'a'), 'pkg-a', 'java');
      await templateSetPackage(join(root, 'store', 'b'), 'pkg-b', 'java');
      await project(join(root, 'proj'), { 'pkg-a': join(root, 'store', 'a'), 'pkg-b': join(root, 'store', 'b') });

      await expect(registerTemplateSets(join(root, 'proj'))).rejects.toThrow(
        /'java' is declared by both pkg-a and pkg-b/
      );
    });

    it('lets an explicit package win over a discovered one', async () => {
      await templateSetPackage(join(root, 'store', 'a'), 'pkg-a', 'java');
      await templateSetPackage(join(root, 'store', 'b'), 'pkg-b', 'java');
      await project(join(root, 'proj'), { 'pkg-a': join(root, 'store', 'a') });

      await registerTemplateSets(join(root, 'proj'), { explicitPackages: [join(root, 'store', 'b')] });
      expect(resolveTemplateSet('java').baseFolder).toBe(join(root, 'store', 'b', 'templates'));
    });

    it('registers again when called a second time', async () => {
      await templateSetPackage(join(root, 'store', 'a'), 'pkg-a', 'java');
      await project(join(root, 'proj'), { 'pkg-a': join(root, 'store', 'a') });

      await registerTemplateSets(join(root, 'proj'));
      await registerTemplateSets(join(root, 'proj'));
      expect(listTemplateSets().filter((set) => set.name === 'java')).toHaveLength(1);
    });

    it('ignores a clash between other names when only one set is wanted', async () => {
      await templateSetPackage(join(root, 'store', 'a'), 'pkg-a', 'java');
      await templateSetPackage(join(root, 'store', 'b'), 'pkg-b', 'java');
      await templateSetPackage(join(root, 'store', 'c'), 'pkg-c', 'cpp');
      await project(join(root, 'proj'), {
        'pkg-a': join(root, 'store', 'a'),
        'pkg-b': join(root, 'store', 'b'),
        'pkg-c': join(root, 'store', 'c'),
      });

      const registered = await registerTemplateSets(join(root, 'proj'), { only: 'cpp' });
      expect(registered.map((info) => info.name)).toEqual(['cpp']);
    });

    it('refuses an explicit folder that declares no template sets', async () => {
      await writeJson(join(root, 'plain', 'package.json'), { name: 'plain' });
      await expect(registerTemplateSets(root, { explicitPackages: [join(root, 'plain')] })).rejects.toThrow(
        /declares no template sets/
      );
    });

    it('refuses a discovered set that takes a built-in name', async () => {
      await templateSetPackage(join(root, 'store', 'ts'), 'ts-pkg', 'typescript');
      await project(join(root, 'proj'), { 'ts-pkg': join(root, 'store', 'ts') });

      await expect(registerTemplateSets(join(root, 'proj'))).rejects.toThrow(/already registered/);
    });
  });
});
