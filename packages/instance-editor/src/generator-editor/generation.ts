import {
  findOverwrittenFiles,
  loadEcorePackage,
  parseConfig,
  planGeneration,
  registerTemplateSets,
  selectTemplateSets,
  summarizeModel,
  writeGeneratedFiles,
  ModelSummary,
} from '@typemf/generator';
import { dirname, relative, resolve, sep } from 'node:path';

export interface GenerationRequest {
  configPath: string;
  configText: string;
  /** Package folders of template sets the user added by hand. */
  explicitPackages: string[];
  /** Whether code of the workspace may run: a template set with a hooks module needs it. */
  trusted: boolean;
  /** Asks whether files that exist with other content may be overwritten. */
  confirmOverwrite(paths: string[]): Promise<boolean>;
}

export type GenerationOutcome = { status: 'done'; outputRoot: string; files: string[] } | { status: 'cancelled' };

/** Generates for the config in `request.configText`; files are written only after confirmOverwrite agrees. */
export async function generateFromConfig(request: GenerationRequest): Promise<GenerationOutcome> {
  const configDir = dirname(request.configPath);
  const config = parseConfig(request.configText, request.configPath);

  const selection = { explicitPackages: request.explicitPackages, only: config.templateSet };
  const [info] = await selectTemplateSets(configDir, selection);
  if (info?.modulePath && !request.trusted) {
    throw new Error(
      `The template set '${info.name}' of ${info.packageName} runs code from the workspace, ` +
        `which needs a trusted workspace.`
    );
  }
  await registerTemplateSets(configDir, selection);

  const pkg = await loadEcorePackage(resolve(configDir, config.ecoreFile));
  const plan = planGeneration(config, configDir, pkg);

  const overwritten = await findOverwrittenFiles(plan.files);
  if (overwritten.length > 0 && !(await request.confirmOverwrite(overwritten))) {
    return { status: 'cancelled' };
  }

  const written = await writeGeneratedFiles(plan.files);
  return {
    status: 'done',
    outputRoot: plan.outputRoot,
    files: written.map((path) => relative(plan.outputRoot, path).split(sep).join('/')),
  };
}

/** Loads the model of `ecoreFile` (relative to `configDir`) and summarizes what the option pickers offer. */
export async function summarizeEcoreFile(configDir: string, ecoreFile: string): Promise<ModelSummary> {
  return summarizeModel(await loadEcorePackage(resolve(configDir, ecoreFile)));
}
