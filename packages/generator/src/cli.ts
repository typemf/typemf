import { dirname, resolve } from 'node:path';
import { loadConfig } from './cli-config.js';
import { loadEcorePackage } from './ecore-loader.js';
import { runGeneration } from './run-generation.js';
import { registerTemplateSets } from './template-set-packages.js';

interface CliArguments {
  configPath: string;
  templateSetPackages: string[];
  discover: boolean;
}

function parseArguments(args: string[]): CliArguments {
  const parsed: CliArguments = { configPath: './typemf-generator.json', templateSetPackages: [], discover: true };
  let configGiven = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === '--no-discover') {
      parsed.discover = false;
    } else if (arg === '--template-set' || arg.startsWith('--template-set=')) {
      const value: string | undefined = arg === '--template-set' ? args[++i] : arg.slice('--template-set='.length);
      if (!value) throw new Error('--template-set needs a package folder.');
      parsed.templateSetPackages.push(value);
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option '${arg}'.`);
    } else if (configGiven) {
      throw new Error(`Unexpected argument '${arg}': only one config file can be given.`);
    } else {
      parsed.configPath = arg;
      configGiven = true;
    }
  }
  return parsed;
}

async function main(): Promise<void> {
  const args = parseArguments(process.argv.slice(2));
  const configPath = resolve(args.configPath);
  const configDir = dirname(configPath);

  const config = await loadConfig(configPath);
  await registerTemplateSets(configDir, {
    explicitPackages: args.templateSetPackages,
    discover: args.discover,
    only: config.templateSet,
  });
  const ecorePath = resolve(configDir, config.ecoreFile);
  const pkg = await loadEcorePackage(ecorePath);

  const { writtenPaths, outputRoot } = await runGeneration(config, configDir, pkg);
  console.log(`typemf-generate: wrote ${writtenPaths.length} file(s) to ${outputRoot}`);
}

main().catch((err: unknown) => {
  console.error(`typemf-generate: ${(err as Error).message}`);
  process.exitCode = 1;
});
