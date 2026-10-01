import { EcorePackageImpl, EPackageRegistry } from '@typemf/core';

/**
 * Registers Ecore's own metamodel (EClass, EAttribute, EPackage, ...) into `registry` - a
 * deliberate, narrow exception to EPackageRegistry's own "nothing pre-registered" design: Ecore
 * itself is foundational, not an arbitrary domain metamodel a dependent extension opts into. Every
 * .ecore file needs it just to be parsed at all, and it's part of the modeling language itself,
 * not something layered on top of it.
 *
 * Without this, opening or creating an instance of Ecore's own classes (e.g. editing a .ecore file
 * directly) had no real path through the "registered metamodel" flow at all - it could only ever
 * go through the dynamic .ecore-file picker, loading a fresh, throwaway copy of Ecore's own
 * metamodel each time rather than using the one, real, already-correct EcorePackageImpl.eINSTANCE
 * every generated package already depends on.
 *
 * Exported standalone (not just called internally by TypeMfRuntime), matching register-defaults.ts's
 * own reasoning: a plain Node script, test, or any other consumer of @typemf/core's
 * EPackageRegistry can opt into this without needing @typemf/vscode-runtime or VS Code at all.
 */
export function registerEcoreMetamodel(registry: EPackageRegistry): void {
  registry.register(EcorePackageImpl.eINSTANCE);
}
