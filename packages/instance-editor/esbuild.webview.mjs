import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';

await esbuild.build({
  entryPoints: ['src-webview/main.tsx'],
  bundle: true,
  outfile: 'dist-webview/main.js',
  platform: 'browser',
  format: 'iife', // a single <script> tag with no module system - matches how resolveCustomEditor loads it
  target: 'es2020',
  jsx: 'automatic',
  sourcemap: true,
  minify: true,
  logLevel: 'info',
});

// esbuild only bundles the JS entry point - styles.css is a separate, static asset
// instance-editor-provider.ts references directly via asWebviewUri, so it needs to land in
// dist-webview/ too, not just be left sitting in src-webview/ where the webview can never load it.
mkdirSync('dist-webview', { recursive: true });
copyFileSync('src-webview/styles.css', 'dist-webview/styles.css');
console.log('copied src-webview/styles.css -> dist-webview/styles.css');
