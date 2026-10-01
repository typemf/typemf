import { EClass, EPackage, isEClass } from '@typemf/core';

/**
 * Every concrete (non-abstract, non-interface), named EClass across the given packages.
 * Deliberately its own file, split out of pick-eclass.ts: this is the one piece of that logic
 * with no vscode dependency at all, and pick-eclass.ts's own `import * as vscode from 'vscode'`
 * (a real value import, needed for vscode.window.showQuickPick) would otherwise fail to resolve
 * for anything - including a test - trying to import this function outside a real extension host.
 */
export function instantiableClasses(packages: readonly EPackage[]): EClass[] {
  const result: EClass[] = [];
  for (const pkg of packages) {
    for (const classifier of pkg.getEClassifiers()) {
      if (isEClass(classifier) && !classifier.isAbstract() && !classifier.isInterface()) {
        result.push(classifier);
      }
    }
  }
  return result;
}

/**
 * Every concrete class across the given packages that is `superType` or one of its subtypes -
 * for child creation, when a containment feature's own declared type is abstract or an interface
 * (or even when it isn't - isSuperTypeOf is reflexive, so a concrete superType is included too;
 * confirmed directly, not assumed) and the user needs to pick which real, instantiable kind of
 * object to actually create.
 */
export function concreteSubtypesOf(superType: EClass, packages: readonly EPackage[]): EClass[] {
  return instantiableClasses(packages).filter((candidate) => superType.isSuperTypeOf(candidate));
}
