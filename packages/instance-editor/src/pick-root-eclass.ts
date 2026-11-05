import { EClass, EPackage } from '@typemf/core';
import type { TypeMfRuntimeApi } from '@typemf/vscode-runtime';
import * as vscode from 'vscode';
import { loadLocalEcorePackage } from './load-local-ecore-package.js';
import { pickEClass } from './pick-eclass.js';

/** A root class and its package: from the shared registry (static) or from a `.ecore` file (dynamic). */
export type PickedRoot = { eClass: EClass; pkg: EPackage } & (
  { mode: 'static' } | { mode: 'dynamic'; ecoreFilePath: string }
);

/**
 * Asks for the class of a new root object: first whether it comes from a registered metamodel or
 * a `.ecore` file, then the class itself. Returns undefined if the user cancels any step.
 */
export async function pickRootEClass(runtime: TypeMfRuntimeApi): Promise<PickedRoot | undefined> {
  const mode = await vscode.window.showQuickPick(
    [
      {
        label: 'Registered metamodel',
        description: 'Pick a class from an already-registered package',
        mode: 'static' as const,
      },
      {
        label: 'Dynamic .ecore file',
        description: 'Pick a class from a .ecore file you select',
        mode: 'dynamic' as const,
      },
    ],
    { placeHolder: 'Where should the root class come from?' }
  );
  if (!mode) return undefined;

  if (mode.mode === 'static') {
    const packages = runtime.packageRegistry.getAllPackages();
    if (packages.length === 0) {
      void vscode.window.showWarningMessage(
        'No metamodels are currently registered. Try "Dynamic .ecore file" instead.'
      );
      return undefined;
    }
    const eClass = await pickEClass(packages);
    const pkg = eClass?.getEPackage();
    return eClass && pkg ? { mode: 'static', eClass, pkg } : undefined;
  }

  const picked = await vscode.window.showOpenDialog({ canSelectMany: false, filters: { 'Ecore Models': ['ecore'] } });
  const fileUri = picked?.[0];
  if (!fileUri) return undefined;

  const pkg = await loadLocalEcorePackage(fileUri);
  const eClass = await pickEClass([pkg]);
  return eClass ? { mode: 'dynamic', eClass, pkg, ecoreFilePath: fileUri.fsPath } : undefined;
}
