import type { Plugin } from 'esbuild';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import semver from 'semver';
import { RUNTIME_EXTENSION_ID } from './runtime-extension-id.js';

/** The modules the runtime extension provides itself. */
export const BUILTIN_SHARED_MODULES = ['@typemf/core', '@typemf/json', '@typemf/node', '@typemf/xmi'] as const;

export interface TypeMfSharedOptions {
  /** Shared modules provided by other extensions, in addition to the built-in TypeMF libraries. */
  modules?: string[];
  /** The package.json the version ranges are read from. Defaults to the one in esbuild's working directory. */
  packageJsonPath?: string;
}

/**
 * esbuild plugin for extensions that use shared modules. Instead of bundling a shared module, every
 * import of it is replaced by a lookup of the single instance held by the TypeMF runtime extension,
 * using the version range declared in package.json. Requires `format: 'cjs'`.
 */
export function typemfShared(options: TypeMfSharedOptions = {}): Plugin {
  return {
    name: 'typemf-shared',
    setup(build) {
      if (build.initialOptions.format !== 'cjs') {
        throw new Error("typemfShared requires esbuild's format to be 'cjs'.");
      }
      const packageJsonPath = options.packageJsonPath ?? resolve(build.initialOptions.absWorkingDir ?? process.cwd(), 'package.json');
      const ranges = readRanges(packageJsonPath);
      const names = [...BUILTIN_SHARED_MODULES, ...(options.modules ?? [])];
      const filter = new RegExp(`^(${names.map(escapeRegExp).join('|')})$`);

      build.onResolve({ filter }, (args) => {
        if (!ranges.has(args.path)) {
          return { errors: [{ text: `Shared module '${args.path}' is imported but not listed in ${packageJsonPath}.` }] };
        }
        return { path: args.path, namespace: 'typemf-shared' };
      });
      build.onResolve({ filter: /^vscode$/ }, () => ({ path: 'vscode', external: true }));
      build.onLoad({ filter: /.*/, namespace: 'typemf-shared' }, (args) => ({
        contents: sharedModuleSource(args.path, ranges.get(args.path)!),
        loader: 'js',
      }));
    },
  };
}

function readRanges(packageJsonPath: string): Map<string, string> {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as Record<string, Record<string, string> | undefined>;
  const ranges = new Map<string, string>();
  for (const field of ['devDependencies', 'dependencies', 'peerDependencies']) {
    for (const [name, raw] of Object.entries(pkg[field] ?? {})) {
      const range = normalizeRange(raw);
      if (semver.validRange(range)) ranges.set(name, range);
    }
  }
  return ranges;
}

/** Turns pnpm's `workspace:` protocol into a plain semver range. */
function normalizeRange(range: string): string {
  const stripped = range.startsWith('workspace:') ? range.slice('workspace:'.length) : range;
  return stripped === '' || stripped === '^' || stripped === '~' ? '*' : stripped;
}

function sharedModuleSource(name: string, range: string): string {
  const id = JSON.stringify(RUNTIME_EXTENSION_ID);
  return [
    `const extension = require('vscode').extensions.getExtension(${id});`,
    `if (!extension || !extension.isActive) {`,
    `  throw new Error(${JSON.stringify(`'${name}' is provided by the extension '${RUNTIME_EXTENSION_ID}', which must be installed and listed in "extensionDependencies".`)});`,
    `}`,
    `module.exports = extension.exports.requireModule(${JSON.stringify(name)}, ${JSON.stringify(range)});`,
  ].join('\n');
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
