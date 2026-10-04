import type { TypeMfRuntimeApi } from '@typemf/vscode-runtime';
import { activateRuntime, BuiltinModuleVersions } from '@typemf/vscode-runtime/host';
import type * as vscode from 'vscode';

declare const TYPEMF_MODULE_VERSIONS: BuiltinModuleVersions;

export function activate(context: vscode.ExtensionContext): Promise<TypeMfRuntimeApi> {
  return activateRuntime(context, TYPEMF_MODULE_VERSIONS);
}

export function deactivate(): void {}
