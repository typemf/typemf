import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JsonSchema, TemplateSet } from './template-set.js';
import { registerTemplateSet } from './template-set-registry.js';

/**
 * A template set declared by an npm package, under `typemf.templateSets` in its package.json:
 *
 *  - `name`: what `templateSet` in a config file says.
 *  - `templates`: the folder with `main.njk`, relative to the package.
 *  - `optionsSchema`: a JSON file with the JSON Schema of the options, relative to the package.
 *  - `module`: a JavaScript module that exports the hooks `validate`, `configureEnvironment` and
 *    `postProcessFile`, relative to the package. Only this module is ever executed.
 */
export interface TemplateSetDeclaration {
  name: string;
  description?: string;
  templates: string;
  optionsSchema?: string;
  module?: string;
}

/** A declared template set, found without running any of the package's code. */
export interface TemplateSetInfo {
  name: string;
  description?: string;
  packageName: string;
  packageDir: string;
  baseFolder: string;
  optionsSchema?: JsonSchema;
  /** Absolute path of the hooks module. */
  modulePath?: string;
  /** How selectTemplateSets came by it. */
  source?: 'discovered' | 'explicit';
}

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  typemf?: { templateSets?: unknown };
}

async function readPackageJson(packageDir: string): Promise<PackageJson | undefined> {
  try {
    return JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf-8')) as PackageJson;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw new Error(`Could not read '${join(packageDir, 'package.json')}': ${(err as Error).message}`, { cause: err });
  }
}

/** The directory of the closest package.json at or above `dir`. */
async function findPackageDir(dir: string): Promise<string | undefined> {
  for (let current = resolve(dir); ; current = dirname(current)) {
    if (await isFile(join(current, 'package.json'))) return current;
    if (dirname(current) === current) return undefined;
  }
}

async function isFile(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/** Where `name` is installed as seen from `fromDir`, found like Node does: in the closest node_modules. */
async function findInstalledPackage(name: string, fromDir: string): Promise<string | undefined> {
  for (let current = resolve(fromDir); ; current = dirname(current)) {
    const candidate = join(current, 'node_modules', name);
    if (await isFile(join(candidate, 'package.json'))) return realpath(candidate);
    if (dirname(current) === current) return undefined;
  }
}

/**
 * The template sets a package declares, with nothing of the package executed. A package without a
 * `typemf.templateSets` field declares none.
 */
export async function readTemplateSetPackage(packageDir: string): Promise<TemplateSetInfo[]> {
  const dir = resolve(packageDir);
  const pkg = await readPackageJson(dir);
  if (!pkg) throw new Error(`'${dir}' is not a package folder: it has no package.json.`);

  const declarations = pkg.typemf?.templateSets;
  if (declarations === undefined) return [];
  const packageName = pkg.name ?? dir;
  if (!Array.isArray(declarations)) {
    throw new Error(`${packageName}: "typemf.templateSets" in package.json must be an array.`);
  }

  const infos: TemplateSetInfo[] = [];
  for (const declaration of declarations as Partial<TemplateSetDeclaration>[]) {
    infos.push(await toInfo(declaration, packageName, dir));
  }
  return infos;
}

async function toInfo(
  declaration: Partial<TemplateSetDeclaration>,
  packageName: string,
  packageDir: string
): Promise<TemplateSetInfo> {
  for (const key of ['name', 'templates'] as const) {
    if (typeof declaration?.[key] !== 'string' || declaration[key] === '') {
      throw new Error(`${packageName}: every entry of "typemf.templateSets" needs a "${key}" string.`);
    }
  }
  const { name, description, templates } = declaration as TemplateSetDeclaration;
  const where = `${packageName}: template set '${name}'`;

  const baseFolder = resolve(packageDir, templates);
  if (!(await isFile(join(baseFolder, 'main.njk')))) {
    throw new Error(`${where}: '${templates}' has no main.njk.`);
  }

  let optionsSchema: JsonSchema | undefined;
  if (declaration.optionsSchema !== undefined) {
    const schemaPath = resolve(packageDir, declaration.optionsSchema);
    try {
      optionsSchema = JSON.parse(await readFile(schemaPath, 'utf-8')) as JsonSchema;
    } catch (err) {
      throw new Error(`${where}: cannot read optionsSchema '${declaration.optionsSchema}': ${(err as Error).message}`, {
        cause: err,
      });
    }
  }

  let modulePath: string | undefined;
  if (declaration.module !== undefined) {
    modulePath = resolve(packageDir, declaration.module);
    if (!(await isFile(modulePath))) throw new Error(`${where}: module '${declaration.module}' does not exist.`);
  }

  return { name, description, packageName, packageDir, baseFolder, optionsSchema, modulePath };
}

/**
 * The template sets of the packages the project depends on: the dependencies, devDependencies and
 * optionalDependencies of the closest package.json at or above `fromDir`, as installed in the
 * closest node_modules. Dependencies that aren't installed are skipped. No package code is run.
 */
export async function discoverTemplateSets(fromDir: string): Promise<TemplateSetInfo[]> {
  const projectDir = await findPackageDir(fromDir);
  if (!projectDir) return [];
  const project = (await readPackageJson(projectDir))!;

  const names = new Set([
    ...Object.keys(project.dependencies ?? {}),
    ...Object.keys(project.devDependencies ?? {}),
    ...Object.keys(project.optionalDependencies ?? {}),
  ]);

  const infos: TemplateSetInfo[] = [];
  for (const name of names) {
    const packageDir = await findInstalledPackage(name, projectDir);
    if (packageDir) infos.push(...(await readTemplateSetPackage(packageDir)));
  }
  return infos;
}

/** Turns what a package declares into a TemplateSet; this is where its hooks module, if any, is executed. */
export async function loadTemplateSet(info: TemplateSetInfo): Promise<TemplateSet> {
  const templateSet: TemplateSet = {
    name: info.name,
    description: info.description,
    baseFolder: info.baseFolder,
    optionsSchema: info.optionsSchema,
  };
  if (info.modulePath) {
    const loaded = (await import(pathToFileURL(info.modulePath).href)) as Record<string, unknown> & {
      default?: Record<string, unknown>;
    };
    const hooks = { ...loaded, ...loaded.default };
    for (const hook of ['validate', 'configureEnvironment', 'postProcessFile'] as const) {
      if (hooks[hook] === undefined) continue;
      if (typeof hooks[hook] !== 'function') {
        throw new Error(
          `${info.packageName}: template set '${info.name}': "${hook}" of the module must be a function.`
        );
      }
      (templateSet as unknown as Record<string, unknown>)[hook] = hooks[hook];
    }
  }
  return templateSet;
}

export interface RegisterTemplateSetsOptions {
  /** Package folders to take template sets from, wins over discovered ones with the same name. */
  explicitPackages?: string[];
  /** Whether to look at the dependencies of the project around `configDir`. Default true. */
  discover?: boolean;
}

export interface TemplateSetSelectionOptions {
  /** Package folders to take template sets from, wins over discovered ones with the same name. */
  explicitPackages?: string[];
  /** Whether to look at the dependencies of the project around `configDir`. Default true. */
  discover?: boolean;
  /** Select only the template set of this name; a clash between other names is no concern then. */
  only?: string;
}

/**
 * The template sets available around `configDir`: those of the explicitly named package folders
 * and, unless `discover` is false, the discovered ones (see discoverTemplateSets). Of two
 * discovered sets with the same name none can be chosen, so that is an error naming both
 * packages; an explicit set wins over a discovered one. No package code is run.
 */
export async function selectTemplateSets(
  configDir: string,
  options: TemplateSetSelectionOptions = {}
): Promise<TemplateSetInfo[]> {
  const explicit: TemplateSetInfo[] = [];
  for (const dir of options.explicitPackages ?? []) {
    const infos = await readTemplateSetPackage(resolve(dir));
    if (infos.length === 0)
      throw new Error(`'${dir}' declares no template sets ("typemf.templateSets" in package.json).`);
    explicit.push(...infos.map((info) => ({ ...info, source: 'explicit' as const })));
  }
  const explicitNames = new Set(explicit.map((info) => info.name));

  const discovered = options.discover === false ? [] : await discoverTemplateSets(configDir);
  const chosen = new Map<string, TemplateSetInfo>();
  for (const info of discovered) {
    if (explicitNames.has(info.name) || (options.only !== undefined && info.name !== options.only)) continue;
    const other = chosen.get(info.name);
    if (other) {
      throw new Error(
        `The template set '${info.name}' is declared by both ${other.packageName} and ${info.packageName}. ` +
          `Pick one with --template-set <package folder>.`
      );
    }
    chosen.set(info.name, { ...info, source: 'discovered' });
  }
  return [...chosen.values(), ...explicit].filter((info) => options.only === undefined || info.name === options.only);
}

/** Names registered from packages, which a later call may replace; a built-in name is never replaced. */
const loadedFromPackages = new Set<string>();

/**
 * Registers the template sets selected by selectTemplateSets. A set must not take the name of a
 * built-in set, but may replace one registered from a package by an earlier call. With `only`,
 * the code of the other packages is not run. Returns the registered sets.
 */
export async function registerTemplateSets(
  configDir: string,
  options: TemplateSetSelectionOptions = {}
): Promise<TemplateSetInfo[]> {
  const result: TemplateSetInfo[] = [];
  for (const info of await selectTemplateSets(configDir, options)) {
    const replace = info.source === 'explicit' || loadedFromPackages.has(info.name);
    registerTemplateSet(await loadTemplateSet(info), { replace });
    loadedFromPackages.add(info.name);
    result.push(info);
  }
  return result;
}
