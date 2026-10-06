import * as vscode from 'vscode';
import type { WorkspaceFileSystem } from './workspace-file-system-uri-converter.js';

/** `vscode.workspace.fs`, adapted to the converter's string-keyed WorkspaceFileSystem. */
export const vscodeWorkspaceFileSystem: WorkspaceFileSystem = {
  readFile: (uri) => Promise.resolve(vscode.workspace.fs.readFile(vscode.Uri.parse(uri))),
  async writeFile(uri, content) {
    const target = vscode.Uri.parse(uri);
    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(target, '..'));
    await vscode.workspace.fs.writeFile(target, content);
  },
  async exists(uri) {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.parse(uri));
      return true;
    } catch {
      return false;
    }
  },
};
