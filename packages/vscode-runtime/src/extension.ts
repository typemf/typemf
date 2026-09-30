import type * as vscode from 'vscode';
import { TypeMfRuntime, TypeMfRuntimeApi, TypeMfRuntimeOptions } from './typemf-runtime.js';

/**
 * `import type` deliberately, not a value import - this file never calls any real vscode.*
 * function, only types `context`'s parameter. A value import of 'vscode' would fail outside the
 * real extension host (it isn't a real, installable npm module - the extension host injects it),
 * which matters here since ./typemf-runtime.js and ./register-defaults.js are meant to be usable
 * (and test-covered) independently of VS Code ever being present at all.
 *
 * `context` itself is unused for now - nothing here currently needs anything off it (no
 * subscriptions to register, no global/workspace state to read). Kept as a parameter anyway since
 * VS Code always calls activate() with it and a future need (e.g. registering a disposable) would
 * otherwise require this signature to change again.
 */
export function activate(_context: vscode.ExtensionContext, options?: TypeMfRuntimeOptions): TypeMfRuntimeApi {
  return new TypeMfRuntime(options);
}

export function deactivate(): void {}
