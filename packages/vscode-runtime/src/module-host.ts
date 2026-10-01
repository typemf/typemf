import semver from 'semver';

/** A module that an extension declares in its manifest; loaded on its first request. */
export interface ModuleDeclaration {
  readonly name: string;
  readonly version: string;
  /** The id of the extension that declares the module. */
  readonly provider: string;
  readonly load: () => unknown;
}

interface ModuleEntry {
  readonly version: string;
  readonly provider: string;
  readonly load: () => unknown;
  loaded?: { value: unknown };
}

/**
 * Holds exactly one instance of every shared module, keyed by npm package name. Modules are either
 * provided as already-loaded objects or declared with a loader that runs on the first request.
 */
export class ModuleHost {
  private readonly entries = new Map<string, ModuleEntry>();
  private readonly conflicts = new Map<string, string[]>();

  /** Adds an already-loaded module. */
  provide(name: string, version: string, module: unknown, provider = 'typemf.vscode-runtime'): void {
    this.add(name, { version, provider, load: () => module, loaded: { value: module } });
  }

  /** Adds a module that is loaded on its first request. */
  declare(declaration: ModuleDeclaration): void {
    if (!semver.valid(declaration.version)) {
      throw new Error(`Module '${declaration.name}' from '${declaration.provider}' has an invalid version '${declaration.version}'.`);
    }
    this.add(declaration.name, { version: declaration.version, provider: declaration.provider, load: declaration.load });
  }

  has(name: string): boolean {
    return this.entries.has(name) || this.conflicts.has(name);
  }

  /** The module `name`, if its version satisfies `range`. Throws otherwise. */
  require(name: string, range: string): unknown {
    const providers = this.conflicts.get(name);
    if (providers) {
      throw new Error(`Module '${name}' is provided by more than one extension (${providers.join(', ')}); only one provider is allowed.`);
    }
    const entry = this.entries.get(name);
    if (!entry) {
      throw new Error(`No installed extension provides module '${name}'.`);
    }
    if (!semver.satisfies(entry.version, range, { includePrerelease: true })) {
      throw new Error(`Module '${name}' ${entry.version} (from '${entry.provider}') does not satisfy the requested range '${range}'.`);
    }
    if (!entry.loaded) {
      entry.loaded = { value: entry.load() };
    }
    return entry.loaded.value;
  }

  private add(name: string, entry: ModuleEntry): void {
    const conflict = this.conflicts.get(name);
    if (conflict) {
      conflict.push(entry.provider);
      return;
    }
    const existing = this.entries.get(name);
    if (existing) {
      this.entries.delete(name);
      this.conflicts.set(name, [existing.provider, entry.provider]);
      return;
    }
    this.entries.set(name, entry);
  }
}
