import { URI, UriConverter } from '@typemf/core';

/**
 * The few file-system operations the converter needs, keyed by the document's URI text
 * (`URI.toString()` without its fragment) - what `vscode.workspace.fs` provides, minus the
 * `vscode.Uri` type, so the converter itself stays free of a `vscode` import and unit-testable.
 */
export interface WorkspaceFileSystem {
  readFile(uri: string): Promise<Uint8Array>;
  /** Writes `content`, creating the file's missing parent directories first. */
  writeFile(uri: string, content: Uint8Array): Promise<void>;
  exists(uri: string): Promise<boolean>;
}

/**
 * A UriConverter backed by VS Code's own file system API instead of Node's `fs` (ED-05), so
 * documents on any registered file system provider - GitHub repositories opened through vscode.dev
 * or "Remote Repositories", remote workspaces - open and save like local files. Handles every
 * absolute URI: VS Code reports an unknown scheme as a file system error when it is actually used,
 * and `canHandle` has no way to ask which providers exist.
 */
export class WorkspaceFileSystemUriConverter implements UriConverter {
  constructor(private readonly fs: WorkspaceFileSystem) {}

  canHandle(uri: URI): boolean {
    return !uri.isRelative();
  }

  readBinary(uri: URI): Promise<Uint8Array> {
    return this.fs.readFile(uri.trimFragment().toString());
  }

  writeBinary(uri: URI, content: Uint8Array): Promise<void> {
    return this.fs.writeFile(uri.trimFragment().toString(), content);
  }

  exists(uri: URI): Promise<boolean> {
    return this.fs.exists(uri.trimFragment().toString());
  }
}
