import * as esbuild from 'esbuild';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { typemfShared } from '../esbuild.js';

function project(dependencies: Record<string, string>, source: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'typemf-shared-'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'consumer', dependencies }));
  writeFileSync(join(dir, 'entry.ts'), source);
  return dir;
}

function build(dir: string, options: esbuild.BuildOptions = {}) {
  return esbuild.build({
    absWorkingDir: dir,
    entryPoints: ['entry.ts'],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',
    logLevel: 'silent',
    plugins: [typemfShared({ modules: ['@acme/library'] })],
    ...options,
  });
}

describe('typemfShared', () => {
  it('replaces shared imports by runtime lookups with the declared ranges', async () => {
    const dir = project(
      { '@typemf/core': 'workspace:^0.5.0', '@acme/library': '^1.2.0' },
      "import { EObjectImpl } from '@typemf/core';\nimport { BookImpl } from '@acme/library';\nexport { EObjectImpl, BookImpl };"
    );

    const output = (await build(dir)).outputFiles![0]!.text;

    expect(output).toContain('requireModule("@typemf/core", "^0.5.0")');
    expect(output).toContain('requireModule("@acme/library", "^1.2.0")');
    expect(output).toContain('require("vscode")');
  });

  it('fails for a shared module missing from package.json', async () => {
    const dir = project({}, "import { EObjectImpl } from '@typemf/core';\nexport { EObjectImpl };");

    await expect(build(dir)).rejects.toThrow(/Shared module '@typemf\/core' is imported but not listed/);
  });

  it('requires the cjs format', async () => {
    const dir = project({}, 'export {};');

    await expect(build(dir, { format: 'esm' })).rejects.toThrow(/requires esbuild's format to be 'cjs'/);
  });
});
