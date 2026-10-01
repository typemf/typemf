import * as esbuild from 'esbuild';
import { readFileSync } from 'node:fs';

const versions = Object.fromEntries(
  ['@typemf/core', '@typemf/json', '@typemf/node', '@typemf/xmi'].map((name) => [
    name,
    JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8')).version,
  ])
);

await esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.cjs',
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['vscode'],
  define: { TYPEMF_MODULE_VERSIONS: JSON.stringify(versions) },
  sourcemap: true,
  logLevel: 'info',
});
