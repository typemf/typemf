import { dirname, resolve } from 'node:path';
import { loadConfig } from './cli-config.js';
import { loadEcorePackage } from './ecore-loader.js';
import { runGeneration } from './run-generation.js';

async function main(): Promise<void> {
  const configPath = resolve(process.argv[2] ?? './typemf-generator.config.json');
  const configDir = dirname(configPath);

  const config = await loadConfig(configPath);
  const ecorePath = resolve(configDir, config.ecoreFile);
  const pkg = await loadEcorePackage(ecorePath);

  const { writtenPaths, outputRoot } = await runGeneration(config, configDir, pkg);
  console.log(`typemf-generate: wrote ${writtenPaths.length} file(s) to ${outputRoot}`);
}

main().catch((err: unknown) => {
  console.error(`typemf-generate: ${(err as Error).message}`);
  process.exitCode = 1;
});
