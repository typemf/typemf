import * as vscode from 'vscode';
import { RUNTIME_EXTENSION_ID } from './runtime-extension-id.js';
import type { TypeMfRuntimeApi } from './api.js';

/**
 * The shared runtime of the `typemf.vscode-runtime` extension. The calling extension must list
 * that extension in its `extensionDependencies`.
 */
export async function getTypeMfRuntime(): Promise<TypeMfRuntimeApi> {
  const extension = vscode.extensions.getExtension<TypeMfRuntimeApi>(RUNTIME_EXTENSION_ID);
  if (!extension) {
    throw new Error(`The extension '${RUNTIME_EXTENSION_ID}' is not installed. Add it to "extensionDependencies".`);
  }
  return extension.activate();
}
