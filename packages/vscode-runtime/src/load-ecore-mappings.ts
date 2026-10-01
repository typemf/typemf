import { EcorePackageImpl, isEPackage, URI } from '@typemf/core';
import { NodeFileUriConverter } from '@typemf/node';
import { join } from 'node:path';
import * as vscode from 'vscode';
import { EcoreMappingEntry, resolveMappings } from './ecore-mappings.js';
import type { TypeMfRuntimeApi } from './api.js';

/**
 * Reads the `typemf.ecoreMappings` setting (merged across scopes, see resolveMappings), loads
 * each entry's .ecore file, and registers its root EPackage into `runtime.packageRegistry`.
 *
 * A real `vscode` value import, unlike typemf-runtime.ts/register-defaults.ts/ecore-mappings.ts -
 * this genuinely needs vscode.workspace.getConfiguration() and real filesystem access, so it's
 * kept in its own file rather than folded into those, the same reasoning extension.ts's own
 * `import type` split was built around.
 */
export async function loadConfiguredEcoreMappings(workspaceFolders: readonly vscode.WorkspaceFolder[], runtime: TypeMfRuntimeApi): Promise<void> {
  const firstFolder = workspaceFolders[0];

  // getConfiguration's second argument is what makes workspaceFolderValue resolve to the RIGHT
  // folder's own settings in a multi-root workspace - and "always resolve relative paths against
  // the first workspace folder" (decided earlier) means that's also the one folder whose
  // workspaceFolderValue is relevant here, not any other folder's.
  const inspected = vscode.workspace.getConfiguration('typemf', firstFolder?.uri).inspect<EcoreMappingEntry[]>('ecoreMappings');
  const mappings = resolveMappings(inspected ?? {});
  if (mappings.length === 0) return;

  if (!firstFolder) {
    console.warn(`typemf.ecoreMappings: ${mappings.length} entr${mappings.length === 1 ? 'y' : 'ies'} configured, but no workspace folder is open to resolve relative paths against - skipping.`);
    return;
  }

  // Ecore's own metamodel must be registered before any .ecore file's xsi:type="ecore:EClass"
  // etc. can be interpreted at all - always safe and correct to register unconditionally, since
  // Ecore's own nsURI (http://www.eclipse.org/emf/2002/Ecore) never collides with a real domain
  // metamodel's, and it's always live once @typemf/core is loaded regardless (the self-hosted
  // swap made that permanent - see @typemf/generator's NOTES.md).
  if (!runtime.packageRegistry.containsPackage(EcorePackageImpl.eINSTANCE.getNsURI() ?? '')) {
    runtime.packageRegistry.register(EcorePackageImpl.eINSTANCE);
  }

  // A file:// converter is needed to actually read .ecore files from disk. The extension host
  // (unlike a webview) is always Node-capable, so registering this into the SHARED
  // uriConverterRegistry - not a separate, throwaway one just for this loading step - is safe,
  // and lets every other extension sharing this runtime benefit from file:// support too, not
  // just this one loading pass.
  if (!runtime.uriConverterRegistry.getConverters().some((converter) => converter instanceof NodeFileUriConverter)) {
    runtime.uriConverterRegistry.register(new NodeFileUriConverter());
  }

  const resourceSet = runtime.createResourceSet();

  for (const mapping of mappings) {
    try {
      const absolutePath = join(firstFolder.uri.fsPath, mapping.ecoreFile);
      const resource = await resourceSet.getResource(URI.createFileURI(absolutePath), true);
      const contents = resource?.getContents();
      // EList.get(0) throws on an empty list rather than returning undefined - check isEmpty()
      // first so a load that produced no root reports the clear message below, not a confusing
      // "index out of bounds" one from the catch block.
      const root = contents && !contents.isEmpty() ? contents.get(0) : undefined;
      if (!root || !isEPackage(root)) {
        console.warn(`typemf.ecoreMappings: entry for '${mapping.nsURI}' (${mapping.ecoreFile}) did not load a valid EPackage - skipping.`);
        continue;
      }
      runtime.packageRegistry.register(root);
    } catch (err) {
      console.warn(`typemf.ecoreMappings: failed to load entry for '${mapping.nsURI}' (${mapping.ecoreFile}): ${(err as Error).message}`);
    }
  }
}
