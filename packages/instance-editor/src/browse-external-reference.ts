import { EClass, URI } from '@typemf/core';
import * as vscode from 'vscode';
import { findTypeCompatibleObjects } from './find-type-compatible-objects.js';
import { InstanceDocument } from './instance-document.js';
import { resolveMissingPackages } from './resolve-missing-packages.js';

/**
 * "Link external..." - the cross-document counterpart to handleReferenceCandidatesRequest's own
 * "search the current document" (see its own reasoning for the shared isSuperTypeOf logic this
 * mirrors). Lets the file picker's own cancel stand for "no candidates" too (returned as
 * `{ candidateIds: [], cancelled: true }`), rather than an error - dismissing a file picker is a
 * completely ordinary, expected outcome, not a failure.
 *
 * Loaded into document's own resourceSet (not a fresh, separate one) deliberately: this reuses
 * the SAME, already-resolved documentRegistry the current document itself uses, so a reference
 * into another instance of the same (or an already-loaded) metamodel matches classifiers
 * correctly without asking the user to resolve it a second time; missing-package resolution
 * (resolveMissingPackages, the same picker openExistingInstance's own flow already uses) only
 * runs for whatever the picked file needs that genuinely isn't registered yet. The loaded
 * resource, and everything in it, then stays alive for as long as anything in the current
 * document's own object graph actually references it - ordinary JS reachability, no extra
 * bookkeeping needed (see ResourceImpl's own getResourceOf/resourceByRoot for how a reference's
 * own cross-document save path depends on this later).
 */
export async function browseExternalReferenceCandidates(
  document: Pick<InstanceDocument, 'resourceSet' | 'objectIds'>,
  declaredType: EClass
): Promise<{ candidateIds: string[]; cancelled: boolean }> {
  const picked = await vscode.window.showOpenDialog({
    canSelectMany: false,
    filters: { 'Model files': ['xmi', 'json', 'ecore'] },
  });
  const fileUri = picked?.[0];
  if (!fileUri) return { candidateIds: [], cancelled: true };

  const externalUri = URI.createFileURI(fileUri.fsPath);
  const bytes = await vscode.workspace.fs.readFile(fileUri);
  const resource = document.resourceSet.createResource(externalUri);

  const packageRegistry = document.resourceSet.getPackageRegistry();
  const needed = await resource.getSerializer().peekReferencedNsURIs(bytes);
  const missing = needed.filter((nsURI) => !packageRegistry.getPackage(nsURI));
  if (missing.length > 0) {
    const resolvedMissing = await resolveMissingPackages(missing);
    if (!resolvedMissing) return { candidateIds: [], cancelled: true };
    for (const pkg of resolvedMissing.values()) packageRegistry.register(pkg);
  }

  await resource.load();

  const candidateIds = findTypeCompatibleObjects(resource, declaredType, document.objectIds);
  return { candidateIds, cancelled: false };
}
