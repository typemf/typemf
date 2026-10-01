import { describe, expect, it, vi } from 'vitest';
import { EcoreMappingEntry, InspectedEcoreMappings, resolveMappings } from '../ecore-mappings.js';

function entry(nsURI: string, ecoreFile: string): EcoreMappingEntry {
  return { nsURI, ecoreFile };
}

describe('resolveMappings', () => {
  it('returns an empty list when nothing is configured at any scope', () => {
    expect(resolveMappings({})).toEqual([]);
  });

  it('returns entries from a single scope unchanged', () => {
    const inspected: InspectedEcoreMappings = {
      workspaceValue: [entry('https://example.com/library', './library.ecore')],
    };
    expect(resolveMappings(inspected)).toEqual([entry('https://example.com/library', './library.ecore')]);
  });

  it('merges distinct nsURIs across all three scopes', () => {
    const inspected: InspectedEcoreMappings = {
      globalValue: [entry('https://example.com/a', './a.ecore')],
      workspaceValue: [entry('https://example.com/b', './b.ecore')],
      workspaceFolderValue: [entry('https://example.com/c', './c.ecore')],
    };
    const result = resolveMappings(inspected);
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.nsURI).sort()).toEqual(['https://example.com/a', 'https://example.com/b', 'https://example.com/c']);
  });

  it('workspaceFolder wins over workspace for the same nsURI - VS Code\'s real precedence, most specific first', () => {
    const inspected: InspectedEcoreMappings = {
      workspaceValue: [entry('https://example.com/shared', './from-workspace.ecore')],
      workspaceFolderValue: [entry('https://example.com/shared', './from-folder.ecore')],
    };
    expect(resolveMappings(inspected)).toEqual([entry('https://example.com/shared', './from-folder.ecore')]);
  });

  it('workspace wins over user (global) for the same nsURI', () => {
    const inspected: InspectedEcoreMappings = {
      globalValue: [entry('https://example.com/shared', './from-user.ecore')],
      workspaceValue: [entry('https://example.com/shared', './from-workspace.ecore')],
    };
    expect(resolveMappings(inspected)).toEqual([entry('https://example.com/shared', './from-workspace.ecore')]);
  });

  it('workspaceFolder wins over user directly, skipping over an absent workspace scope', () => {
    const inspected: InspectedEcoreMappings = {
      globalValue: [entry('https://example.com/shared', './from-user.ecore')],
      workspaceFolderValue: [entry('https://example.com/shared', './from-folder.ecore')],
    };
    expect(resolveMappings(inspected)).toEqual([entry('https://example.com/shared', './from-folder.ecore')]);
  });

  it('keeps the first of two duplicate entries within the very same scope\'s own array, and warns', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const inspected: InspectedEcoreMappings = {
      workspaceValue: [entry('https://example.com/dup', './first.ecore'), entry('https://example.com/dup', './second.ecore')],
    };
    expect(resolveMappings(inspected)).toEqual([entry('https://example.com/dup', './first.ecore')]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('https://example.com/dup');
    warnSpy.mockRestore();
  });

  it('warns once per discarded duplicate across scopes, not once per nsURI overall', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const inspected: InspectedEcoreMappings = {
      globalValue: [entry('https://example.com/dup', './from-user.ecore')],
      workspaceValue: [entry('https://example.com/dup', './from-workspace.ecore')],
      workspaceFolderValue: [entry('https://example.com/dup', './from-folder.ecore')],
    };
    resolveMappings(inspected);
    // 3 entries, 1 kept (workspaceFolder), 2 discarded (workspace, global) - one warning each.
    expect(warnSpy).toHaveBeenCalledTimes(2);
    warnSpy.mockRestore();
  });
});
