import { EPackage, isEPackage } from '@typemf/core';
import { join } from 'node:path';
import type { TypeMfRuntime } from './typemf-runtime.js';

/** One entry of `typemf.modules` in an extension's package.json. */
export interface ManifestModuleEntry {
  /** Path to the module's CommonJS bundle, relative to the extension folder. */
  path: string;
  version: string;
  /** Maps each nsURI the module contains to the export holding its EPackage (or a class with a static `eINSTANCE`). */
  packages?: Record<string, string>;
}

/** The parts of a `vscode.Extension` this file needs. */
export interface ExtensionInfo {
  readonly id: string;
  readonly extensionPath: string;
  readonly packageJSON: unknown;
}

/**
 * Declares every module listed under `typemf.modules` in the extensions' manifests in
 * `runtime.modules`, and registers a descriptor in `runtime.packageRegistry` for each nsURI they
 * contain. `loadFile` loads a module bundle by absolute path. Returns one message per skipped entry.
 */
export function registerManifestModules(
  runtime: TypeMfRuntime,
  extensions: readonly ExtensionInfo[],
  loadFile: (absolutePath: string) => unknown
): string[] {
  const problems: string[] = [];
  for (const extension of extensions) {
    const modules = (extension.packageJSON as { typemf?: { modules?: unknown } } | undefined)?.typemf?.modules;
    if (modules === undefined) continue;
    if (typeof modules !== 'object' || modules === null) {
      problems.push(`${extension.id}: 'typemf.modules' must be an object.`);
      continue;
    }
    for (const [name, raw] of Object.entries(modules)) {
      const entry = raw as Partial<ManifestModuleEntry>;
      if (typeof entry.path !== 'string' || typeof entry.version !== 'string') {
        problems.push(`${extension.id}: module '${name}' needs a string 'path' and 'version'.`);
        continue;
      }
      const absolutePath = join(extension.extensionPath, entry.path);
      try {
        runtime.modules.declare({
          name,
          version: entry.version,
          provider: extension.id,
          load: () => loadFile(absolutePath),
        });
      } catch (err) {
        problems.push(`${extension.id}: ${(err as Error).message}`);
        continue;
      }
      for (const [nsURI, exportName] of Object.entries(entry.packages ?? {})) {
        if (runtime.packageRegistry.containsPackage(nsURI)) {
          problems.push(
            `${extension.id}: nsURI '${nsURI}' of module '${name}' is already registered; keeping the existing registration.`
          );
          continue;
        }
        runtime.packageRegistry.registerDescriptor(nsURI, () =>
          packageFromExport(runtime.modules.require(name, entry.version!), name, exportName)
        );
      }
    }
  }
  return problems;
}

function packageFromExport(module: unknown, moduleName: string, exportName: string): EPackage {
  const exported = (module as Record<string, unknown> | undefined)?.[exportName] as { eINSTANCE?: unknown } | undefined;
  const pkg = exported?.eINSTANCE ?? exported;
  if (!isEPackage(pkg)) {
    throw new Error(
      `Export '${exportName}' of module '${moduleName}' is neither an EPackage nor a class with a static EPackage 'eINSTANCE'.`
    );
  }
  return pkg;
}
