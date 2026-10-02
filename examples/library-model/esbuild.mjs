import { typemfShared } from '@typemf/vscode-runtime/esbuild';
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/library-model.cjs',
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  plugins: [typemfShared()],
  sourcemap: true,
  logLevel: 'info',
});
