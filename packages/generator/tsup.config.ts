import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    tsconfig: 'tsconfig.json',
  },
  {
    entry: { cli: 'src/cli.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: false,
    clean: false,
    tsconfig: 'tsconfig.json',
    banner: { js: '#!/usr/bin/env node' },
  },
]);
