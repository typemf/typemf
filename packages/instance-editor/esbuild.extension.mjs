import { generatorConfigSchema, typescriptTemplateSet } from '@typemf/generator';
import { typemfShared } from '@typemf/vscode-runtime/esbuild';
import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

await esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.cjs',
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['vscode', 'chokidar'],
  plugins: [typemfShared()],
  // The generator finds its templates relative to its own file; in the bundle that is dist/extension.cjs.
  define: { 'import.meta.url': '__importMetaUrl' },
  banner: { js: "const __importMetaUrl = require('node:url').pathToFileURL(__filename).href;" },
  sourcemap: true,
  logLevel: 'info',
});

function copyDirectory(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    if (entry.isDirectory()) copyDirectory(join(from, entry.name), join(to, entry.name));
    else copyFileSync(join(from, entry.name), join(to, entry.name));
  }
}

// The templates sit next to dist/, where the generator looks for them.
const generatorTemplates = fileURLToPath(new URL('../generator/templates', import.meta.url));
rmSync('templates', { recursive: true, force: true });
copyDirectory(generatorTemplates, 'templates');
console.log('copied the generator templates -> templates');

// The schema VS Code uses when the config is edited as text.
mkdirSync('schemas', { recursive: true });
writeFileSync(
  'schemas/typemf-generator.schema.json',
  JSON.stringify(generatorConfigSchema([typescriptTemplateSet]), null, 2) + '\n'
);
console.log('wrote schemas/typemf-generator.schema.json');
