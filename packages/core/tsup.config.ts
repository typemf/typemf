import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // Members tagged @internal are used across core's own modules but are not part of its API.
  dts: { compilerOptions: { stripInternal: true } },
  sourcemap: true,
  clean: true,
  tsconfig: 'tsconfig.json',
});
