import { EClass, EPackage } from '@typemf/core';
import { TypeMfRuntimeApi } from 'vscode-runtime';
import * as vscode from 'vscode';
import { InstanceEditorProvider } from './instance-editor-provider.js';
import { loadLocalEcorePackage } from './load-local-ecore-package.js';
import { buildNewInstanceUri, encodeDynamicSpec, encodeStaticSpec } from './new-instance-spec-uri.js';
import { pickEClass } from './pick-eclass.js';

let nextId = 1;

/** Registers the "typemf.newModelInstance" command against `runtime`. */
export function registerNewInstanceCommand(runtime: TypeMfRuntimeApi): vscode.Disposable {
  return vscode.commands.registerCommand('typemf.newModelInstance', () => void newModelInstance(runtime));
}

async function newModelInstance(runtime: TypeMfRuntimeApi): Promise<void> {
  const picked = await pickRootEClass(runtime);
  if (!picked) return; // user cancelled somewhere in the static/dynamic/class picks

  const format = await vscode.window.showQuickPick(
    [
      { label: 'xmi', description: 'XMI' },
      { label: 'json', description: 'JSON' },
      { label: 'ecore', description: 'Ecore (XMI-based) - only really meaningful for a root that is itself an EPackage' },
    ],
    { placeHolder: 'Select the file format for the new instance' }
  );
  if (!format) return;

  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    void vscode.window.showErrorMessage('TypeMF: New Model Instance needs an open workspace folder.');
    return;
  }

  const encoded = picked.mode === 'static' ? encodeStaticSpec(picked.eClass, picked.pkg) : encodeDynamicSpec(picked.eClass, picked.ecoreFilePath);
  const uri = buildNewInstanceUri(folder.uri, `new-${nextId++}.${format.label}`, encoded);
  await vscode.commands.executeCommand('vscode.openWith', uri, InstanceEditorProvider.viewType);
}

type PickedRoot = { eClass: EClass } & ({ mode: 'static'; pkg: EPackage } | { mode: 'dynamic'; ecoreFilePath: string });

/** Static (a package already in runtime.packageRegistry) or dynamic (a picked .ecore file). */
async function pickRootEClass(runtime: TypeMfRuntimeApi): Promise<PickedRoot | undefined> {
  const mode = await vscode.window.showQuickPick(
    [
      { label: 'Registered metamodel', description: 'Pick a class from an already-registered package', mode: 'static' as const },
      { label: 'Dynamic .ecore file', description: 'Pick a class from a .ecore file you select', mode: 'dynamic' as const },
    ],
    { placeHolder: 'Where should the root class come from?' }
  );
  if (!mode) return undefined;

  if (mode.mode === 'static') {
    const packages = runtime.packageRegistry.getAllPackages();
    if (packages.length === 0) {
      void vscode.window.showWarningMessage('No metamodels are currently registered. Try "Dynamic .ecore file" instead.');
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
  return eClass ? { mode: 'dynamic', eClass, ecoreFilePath: fileUri.fsPath } : undefined;
}
