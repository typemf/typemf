import * as vscode from 'vscode';
import { loadConfiguredEcoreMappings } from './load-ecore-mappings.js';
import { TypeMfRuntime, TypeMfRuntimeApi, TypeMfRuntimeOptions } from './typemf-runtime.js';

/**
 * A real value import now, not `import type` - loadConfiguredEcoreMappings (called below) needs
 * vscode.workspace.workspaceFolders, a genuine runtime value, not just a type. typemf-runtime.ts,
 * register-defaults.ts, and ecore-mappings.ts remain fully VS Code-independent; only this file
 * and load-ecore-mappings.ts carry a real dependency on vscode being present.
 *
 * `context` itself is still unused - nothing here currently needs anything off it (no
 * subscriptions to register, no global/workspace state to read). Kept as a parameter anyway since
 * VS Code always calls activate() with it and a future need (e.g. registering a disposable) would
 * otherwise require this signature to change again.
 *
 * Now async: loadConfiguredEcoreMappings does real file I/O (reading each configured .ecore
 * file), so activate() must await it before returning the runtime - a real, visible signature
 * change from the plain synchronous version this started as. VS Code supports an async
 * activate() natively (it awaits whatever activate() returns before considering the extension
 * fully active), so this needs no special handling on the VS Code side.
 */
export async function activate(_context: vscode.ExtensionContext, options?: TypeMfRuntimeOptions): Promise<TypeMfRuntimeApi> {
  const runtime = new TypeMfRuntime(options);
  await loadConfiguredEcoreMappings(vscode.workspace.workspaceFolders ?? [], runtime);
  return runtime;
}

export function deactivate(): void {}
