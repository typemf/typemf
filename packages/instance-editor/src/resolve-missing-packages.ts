import { EPackage } from '@typemf/core';
import * as vscode from 'vscode';
import { loadLocalEcorePackage } from './load-local-ecore-package.js';

/**
 * A persistent picker (not a sequence of separate dialogs) that stays open until every missing
 * nsURI is resolved - only then does "Load" become reachable at all, since the item list stays
 * empty (and so has nothing for Enter/onDidAccept to confirm) until `remaining` is empty. `Esc`
 * (the standard way to dismiss any VS Code QuickPick) is Cancel; no separate Cancel button.
 *
 * A picked .ecore file whose own nsURI doesn't match anything still missing gets a transient
 * warning toast, not a blocking error - "it should not hurt" (an explicit design decision) - the
 * picker keeps running exactly as it was.
 *
 * Returns a Map from nsURI to the resolved EPackage once every missing nsURI is accounted for, or
 * undefined if the user cancelled before that happened.
 */
export async function resolveMissingPackages(missing: readonly string[]): Promise<Map<string, EPackage> | undefined> {
  const resolved = new Map<string, EPackage>();
  const remaining = new Set(missing);

  return new Promise((resolvePromise) => {
    const qp = vscode.window.createQuickPick();
    qp.ignoreFocusOut = true;
    const browseButton: vscode.QuickInputButton = {
      iconPath: new vscode.ThemeIcon('folder-opened'),
      tooltip: 'Select .ecore file(s)...',
    };
    qp.buttons = [browseButton];

    let settled = false;
    const refresh = (): void => {
      qp.title =
        remaining.size === 0
          ? 'All required metamodels resolved - press Enter to load'
          : `Missing metamodels (${remaining.size}): ${[...remaining].join(', ')}`;
      qp.items = remaining.size === 0 ? [{ label: '$(check) Load' }] : [];
    };
    refresh();

    qp.onDidTriggerButton(() => {
      void (async () => {
        const picked = await vscode.window.showOpenDialog({
          canSelectMany: true,
          filters: { 'Ecore Models': ['ecore'] },
        });
        if (!picked || picked.length === 0) return;

        qp.busy = true;
        for (const fileUri of picked) {
          try {
            const pkg = await loadLocalEcorePackage(fileUri);
            const nsURI = pkg.getNsURI();
            if (nsURI && remaining.has(nsURI)) {
              resolved.set(nsURI, pkg);
              remaining.delete(nsURI);
            } else {
              void vscode.window.showWarningMessage(
                `'${fileUri.fsPath}' provides '${nsURI ?? '(no nsURI)'}', which wasn't one of the missing metamodels - ignored.`
              );
            }
          } catch (err) {
            void vscode.window.showWarningMessage(`Failed to load '${fileUri.fsPath}': ${(err as Error).message}`);
          }
        }
        qp.busy = false;
        refresh();
      })();
    });

    qp.onDidAccept(() => {
      if (remaining.size === 0) {
        settled = true;
        qp.hide();
        resolvePromise(resolved);
      }
    });

    qp.onDidHide(() => {
      qp.dispose();
      if (!settled) resolvePromise(undefined);
    });

    qp.show();
  });
}
