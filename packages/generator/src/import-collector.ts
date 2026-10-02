import { posix } from 'node:path';

export type ImportLocation = 'root' | 'types' | 'impl' | 'util';

export interface ImportEntry {
  /** The identifier as it appears in generated code. */
  name: string;
  /** Which conceptual folder this name's own generated file lives in. */
  location: ImportLocation;
  /** File base name (no extension), if different from `name` - e.g. "Ids" and "EcorePackage" both come from the same file, "EcorePackage.js". */
  file?: string;
  /**
   * true for the foundational Ecore meta-types (EClass, EObjectImpl,
   * BasicEList, ...) that also exist as @typemf/core exports - these
   * resolve to '@typemf/core' in ordinary mode, and to a relative import
   * in generate-ecore mode (since that same file is being produced by
   * this generation run instead). false for names unique to the
   * metamodel being generated right now (the package class, its factory,
   * its Ref module, every classifier's own type) - these never exist in
   * @typemf/core at all, so they're always a relative import, regardless
   * of generate-ecore.
   */
  foundational: boolean;
  /**
   * An explicit module to import `name` from, overriding location/file/
   * foundational entirely - set from a type's import information (see
   * TypeImportMapping). A value starting with "./" or "../" is relative to the
   * ROOT of the generated package (where {Pkg}Package.ts lives), and gets
   * re-expressed relative to each importing file's own folder; anything
   * else is a bare module specifier, used verbatim.
   */
  from?: string;
}

/**
 * Computes the relative import path from a file in `from` to a file
 * named `file` living in `to` - both are the four conceptual folders
 * every generated package has (root alongside types/, impl/, util/).
 * Always a direct file path, never a barrel (`index.js`) - see
 * coreImportLine's old doc comment in git history for why: importing
 * from your own folder's barrel puts every file in that folder into one
 * strongly-connected component, which broke self-hosting's bootstrap
 * outright (confirmed empirically, not theoretical).
 */
export function relativeImportPath(from: ImportLocation, to: ImportLocation, file: string): string {
  if (from === to) return `./${file}.js`;
  if (from === 'root') return `./${to}/${file}.js`;
  if (to === 'root') return `../${file}.js`;
  return `../${to}/${file}.js`;
}

/**
 * Collects every type reference a template makes while rendering one
 * file's body (via `useType()`, see typescript-template-set.ts), then
 * renders the deduplicated, sorted, direct (never-barrel) import
 * statements for that file once its body is fully known.
 *
 * One instance lives for the whole generation run, reused across files:
 * call `clear()` between files (postProcessFile does this after each
 * file, in typescript-template-set.ts) rather than constructing a new
 * one - nunjucks globals are registered once for the whole Environment,
 * so this needs to be a single, stable object `useType` can find via
 * closure, not re-created per file.
 */
export class ImportCollector {
  /**
   * Every distinct way each name has been requested. Usually one; more
   * than one is only a problem if, once the mode and importing folder are
   * known (render time), they resolve to genuinely different modules.
   */
  private entries = new Map<string, ImportEntry[]>();

  add(entry: ImportEntry): void {
    const variants = this.entries.get(entry.name) ?? [];
    const sameSource = variants.findIndex(
      (v) => v.location === entry.location && (v.file ?? v.name) === (entry.file ?? entry.name) && v.from === entry.from
    );
    if (sameSource >= 0) {
      // Same source, different `foundational`: both resolve identically
      // once the mode is known (see ImportEntry's own doc comment) - this
      // genuinely happens for a real Ecore.ecore classifier that's ALSO
      // one of the fixed, always-present parameter/return types every
      // generated class has (e.g. "EStructuralFeature" in eGet(feature:
      // EStructuralFeature), separately from any reference to it AS a
      // classifier via referencedApiTypes). Prefer foundational: true -
      // the more general categorization, correct in both modes.
      if (entry.foundational && !variants[sameSource]!.foundational) variants[sameSource] = entry;
    } else {
      variants.push(entry);
    }
    this.entries.set(entry.name, variants);
  }

  clear(): void {
    this.entries.clear();
  }

  isEmpty(): boolean {
    return this.entries.size === 0;
  }

  render(currentLocation: ImportLocation, options: Record<string, unknown>): string {
    const generateEcore = Boolean(options['generate-ecore']);
    const corePackageNames: string[] = [];
    const groups = new Map<string, { specifier: string; names: string[] }>();
    const addToGroup = (key: string, specifier: string, name: string) => {
      if (!groups.has(key)) groups.set(key, { specifier, names: [] });
      groups.get(key)!.names.push(name);
    };

    for (const name of [...this.entries.keys()].sort((a, b) => a.localeCompare(b))) {
      const resolved = this.entries
        .get(name)!
        .map((entry) => ({ entry, ...resolveEntry(entry, currentLocation, generateEcore) }));

      // Two requests for the same name are one import only if they name
      // the same module - "the same module, however spelled": the
      // extension is not significant (a datatype annotation's
      // an annotation's import path is used exactly as written, generated
      // paths always carry ".js").
      const distinct = new Set(resolved.map((r) => r.specifier.replace(/\.(js|ts)$/, '')));
      if (distinct.size > 1) {
        throw new Error(
          `Import collision while generating: "${name}" was requested from ` +
            `${resolved.map((r) => `"${r.specifier}"`).join(' and ')}. A single name must resolve to exactly one real source.`
        );
      }
      // An explicitly requested spelling (an annotation's own path) wins over a generated one.
      const chosen = resolved.find((r) => r.entry.from !== undefined) ?? resolved[0]!;
      if (chosen.core) corePackageNames.push(name);
      else addToGroup(chosen.key, chosen.specifier, name);
    }

    const lines: string[] = [];
    if (corePackageNames.length > 0) {
      lines.push(`import { ${corePackageNames.join(', ')} } from '@typemf/core';`);
    }
    for (const key of [...groups.keys()].sort()) {
      const { specifier, names } = groups.get(key)!;
      lines.push(`import { ${names.join(', ')} } from '${specifier}';`);
    }
    return lines.join('\n');
  }
}

function resolveEntry(
  entry: ImportEntry,
  currentLocation: ImportLocation,
  generateEcore: boolean
): { specifier: string; key: string; core: boolean } {
  if (entry.from !== undefined) {
    const specifier = explicitImportSpecifier(entry.from, currentLocation);
    // An explicitly requested "@typemf/core" IS the foundational package - one merged statement, not two.
    return { specifier, key: `~${specifier}`, core: specifier === '@typemf/core' };
  }
  if (entry.foundational && !generateEcore) return { specifier: '@typemf/core', key: '@typemf/core', core: true };
  const file = entry.file ?? entry.name;
  return {
    specifier: relativeImportPath(currentLocation, entry.location, file),
    key: `${entry.location}/${file}`,
    core: false,
  };
}

/** See ImportEntry.from. */
export function explicitImportSpecifier(from: string, currentLocation: ImportLocation): string {
  if (!from.startsWith('./') && !from.startsWith('../')) return from;
  const fromDir = posix.join('/pkg', currentLocation === 'root' ? '' : currentLocation);
  const relative = posix.relative(fromDir, posix.join('/pkg', from));
  return relative.startsWith('.') ? relative : `./${relative}`;
}

/**
 * The single collector shared by the whole typescript template set: both
 * templates (via useImport) and type-text functions (see
 * typescript-filters.ts's tsScalarType, which registers a datatype's
 * annotation-supplied import as it emits the type) record into this one
 * instance, and postProcessFile renders and clears it once per file.
 */
export const importCollector = new ImportCollector();

/** Derives a file's ImportLocation from its own generated path (e.g. "types/EClass.ts" -> "types", "EcorePackage.ts" -> "root"). */
export function locationOfPath(path: string): ImportLocation {
  if (path.startsWith('types/')) return 'types';
  if (path.startsWith('impl/')) return 'impl';
  if (path.startsWith('util/')) return 'util';
  return 'root';
}
