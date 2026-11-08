import type { TypeMfRuntimeApi } from '@typemf/vscode-runtime';
import * as vscode from 'vscode';
import { InstanceEditorProvider } from './instance-editor-provider.js';
import { buildNewInstanceUri, encodeDynamicSpec, encodeStaticSpec } from './new-instance-spec-uri.js';
import { pickRootEClass } from './pick-root-eclass.js';

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
      {
        label: 'ecore',
        description: 'Ecore (XMI-based) - only really meaningful for a root that is itself an EPackage',
      },
    ],
    { placeHolder: 'Select the file format for the new instance' }
  );
  if (!format) return;

  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    void vscode.window.showErrorMessage('TypeMF: New Model Instance needs an open workspace folder.');
    return;
  }

  const encoded =
    picked.mode === 'static'
      ? encodeStaticSpec(picked.eClass, picked.pkg)
      : encodeDynamicSpec(picked.eClass, picked.ecoreFilePath);
  const uri = buildNewInstanceUri(folder.uri, `new-${nextId++}.${format.label}`, encoded);
  await vscode.commands.executeCommand('vscode.openWith', uri, InstanceEditorProvider.viewType);
}
