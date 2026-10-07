import { EPackage } from '@typemf/core';
import nunjucks from 'nunjucks';
import { FileExtension } from './file-extension.js';
import { GeneratedFile } from './generated-file.js';
import { assignFreshIds } from './id-assignment.js';
import { TemplateSet } from './template-set.js';

/**
 * Renders `templateSet`'s main.njk once, over the whole `pkg`. Pure - no
 * disk I/O beyond reading the template files themselves; writing the
 * returned files anywhere is a separate, later step the caller owns. See
 * the design discussion for why `outputDir` deliberately isn't a
 * parameter here: every returned path is relative, so relative imports
 * between generated files are computable without knowing an eventual
 * absolute location.
 */
export function generate(
  pkg: EPackage,
  templateSet: TemplateSet,
  options: Record<string, unknown> = {}
): GeneratedFile[] {
  assignFreshIds(pkg);

  const problems = templateSet.validate?.(pkg, options) ?? [];
  if (problems.length > 0) {
    throw new Error(
      `Cannot generate from this package - ${templateSet.name} found ${problems.length} unresolved problem(s):\n` +
        problems.map((p) => `  - ${p}`).join('\n')
    );
  }

  const loader = new nunjucks.FileSystemLoader(templateSet.baseFolder, { noCache: true });
  const env = new nunjucks.Environment(loader, { autoescape: false, trimBlocks: true, lstripBlocks: true });

  const fileExtension = new FileExtension(
    templateSet.postProcessFile ? (path, content) => templateSet.postProcessFile!(path, content, options) : undefined
  );
  env.addExtension('file', fileExtension);
  env.addGlobal('package', pkg);
  env.addGlobal('options', options);

  templateSet.configureEnvironment?.(env, { pkg, options });

  env.render('main.njk');

  return fileExtension.getCollected();
}
