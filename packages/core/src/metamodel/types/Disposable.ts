/**
 * A handle for releasing some resource or subscription - deliberately the same minimal shape as
 * vscode.Disposable ({ dispose(): void }), but @typemf/core has no dependency on vscode at all,
 * here or anywhere else. Defined independently: a single dispose() method is a generic,
 * long-established pattern that predates and exists independently of VS Code (.NET's
 * IDisposable, RxJS's Subscription), not something borrowed from it.
 *
 * TypeScript's structural typing means anything satisfying this interface also satisfies
 * vscode.Disposable, and vice versa, with no explicit conversion needed anywhere - a Disposable
 * this package returns can be pushed straight into a VS Code extension's own
 * context.subscriptions array, exactly like the ones vscode.EventEmitter.event(...) itself
 * returns, without @typemf/core ever importing 'vscode' to make that work.
 */
export interface Disposable {
  dispose(): void;
}
