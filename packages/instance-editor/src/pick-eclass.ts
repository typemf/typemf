import { EClass, EPackage } from '@typemf/core';
import * as vscode from 'vscode';
import { instantiableClasses } from './instantiable-classes.js';

interface EClassQuickPickItem extends vscode.QuickPickItem {
  eClass: EClass;
}

/**
 * Prompts for one concrete EClass across the given packages, shown as "ClassName" with its own
 * package name as the description - so same-named classes in different packages (or just
 * multiple packages at once) stay distinguishable.
 */
export async function pickEClass(packages: readonly EPackage[]): Promise<EClass | undefined> {
  const classes = instantiableClasses(packages);
  if (classes.length === 0) {
    void vscode.window.showWarningMessage('No concrete (non-abstract, non-interface) classes are available to create an instance of.');
    return undefined;
  }

  const items: EClassQuickPickItem[] = classes.map((eClass) => ({
    label: eClass.getName() ?? '(unnamed)',
    description: eClass.getEPackage()?.getName(),
    eClass,
  }));

  const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Select the root class for the new instance' });
  return picked?.eClass;
}
