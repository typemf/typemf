import { EClassifier, EPackage } from '@typemf/core';
import { TypeImportEntries, TypeImportMapping } from './type-import-mapping.js';

/**
 * What the type-resolution code needs to know about the generation in
 * progress: which package is being generated (so it can tell an internal
 * type from an external one), and the import mapping. A single shared
 * instance, like the import collector, set up once per generate() call by
 * the typescript template set (see beginGeneration) - the type-text
 * functions are called from templates and have no other way to reach it.
 */
export interface GenerationContext {
  pkg: EPackage | undefined;
  typeImports: TypeImportMapping;
  /** The `generate-ecore` option: the package is Ecore itself, generating @typemf/core. */
  generateEcore: boolean;
  /** The `package-imports` option: where the generated code of another package is, by nsURI. */
  packageImports: Map<string, string>;
}

export const generationContext: GenerationContext = {
  pkg: undefined,
  typeImports: new TypeImportMapping(),
  generateEcore: false,
  packageImports: new Map(),
};

/** The generation option for generating Ecore itself (@typemf/core's metamodel). */
export const GENERATE_ECORE_OPTION = 'generate-ecore';

/** The generation option that pre-populates the mapping - see TypeImportMapping. */
export const TYPE_IMPORTS_OPTION = 'type-imports';

/**
 * The generation option that says where the generated code of each referenced package is: an
 * object from nsURI to either a path starting with "./" or "../", relative to the root of the
 * package being generated, or a module name that exports the package's types and its PackageImpl.
 */
export const PACKAGE_IMPORTS_OPTION = 'package-imports';

export function beginGeneration(pkg: EPackage, options: Record<string, unknown>): void {
  generationContext.pkg = pkg;
  const entries = options[TYPE_IMPORTS_OPTION];
  const valid = typeof entries === 'object' && entries !== null && !Array.isArray(entries);
  generationContext.typeImports = new TypeImportMapping(valid ? (entries as TypeImportEntries) : {});
  generationContext.generateEcore = options[GENERATE_ECORE_OPTION] === true;
  generationContext.packageImports = new Map(
    Object.entries(objectOption(options[PACKAGE_IMPORTS_OPTION])).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1] !== ''
    )
  );
}

function objectOption(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/** Back to "no generation in progress": nothing is external, the mapping is empty. */
export function resetGenerationContext(): void {
  generationContext.pkg = undefined;
  generationContext.typeImports = new TypeImportMapping();
  generationContext.generateEcore = false;
  generationContext.packageImports = new Map();
}

/**
 * The internal/external decision, made per use during generation: a type
 * is EXTERNAL when it belongs to a package other than the one being
 * generated. With no generation in progress, or a type that belongs to no
 * package, nothing can be external.
 */
export function isExternal(classifier: EClassifier): boolean {
  const owner = classifier.getEPackage();
  return generationContext.pkg !== undefined && owner !== undefined && owner !== generationContext.pkg;
}
