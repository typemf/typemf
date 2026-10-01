import { typemfShared } from '@typemf/vscode-runtime/esbuild';
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.cjs',
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['vscode'],
  plugins: [typemfShared()],
  sourcemap: true,
  logLevel: 'info',
});
