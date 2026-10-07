import { URI } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { WorkspaceFileSystem, WorkspaceFileSystemUriConverter } from '../workspace-file-system-uri-converter.js';

function fakeFileSystem() {
  const files = new Map<string, Uint8Array>();
  const fs: WorkspaceFileSystem = {
    readFile: async (uri) => {
      const content = files.get(uri);
      if (!content) throw new Error(`no such file: ${uri}`);
      return content;
    },
    writeFile: async (uri, content) => {
      files.set(uri, content);
    },
    exists: async (uri) => files.has(uri),
  };
  return { files, fs };
}

describe('WorkspaceFileSystemUriConverter', () => {
  it('handles absolute URIs of any scheme, but not relative references', () => {
    const converter = new WorkspaceFileSystemUriConverter(fakeFileSystem().fs);
    expect(converter.canHandle(URI.parse('file:///tmp/a.xmi'))).toBe(true);
    expect(converter.canHandle(URI.parse('vscode-vfs://github/owner/repo/a.xmi'))).toBe(true);
    expect(converter.canHandle(URI.parse('other.xmi#//@books.0'))).toBe(false);
  });

  it('writes and reads back through the file system, keyed by the URI without its fragment', async () => {
    const { files, fs } = fakeFileSystem();
    const converter = new WorkspaceFileSystemUriConverter(fs);
    const uri = URI.parse('vscode-vfs://github/owner/repo/model.xmi#//@books.0');
    const content = new Uint8Array([1, 2, 3]);

    await converter.writeBinary(uri, content);

    expect([...files.keys()]).toEqual(['vscode-vfs://github/owner/repo/model.xmi']);
    expect(await converter.readBinary(uri)).toBe(content);
    expect(await converter.exists(uri)).toBe(true);
    expect(await converter.exists(URI.parse('vscode-vfs://github/owner/repo/missing.xmi'))).toBe(false);
  });
});
