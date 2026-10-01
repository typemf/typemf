import { EClass, EPackage, isEClass } from '@typemf/core';
import { TypeMfRuntimeApi } from 'vscode-runtime';
import { loadLocalEcorePackage } from './load-local-ecore-package.js';

/**
 * What a brand-new instance needs to construct its root, in a form that can be re-resolved fresh
 * from scratch rather than carried as a live object reference - a real EClass can't survive being
 * encoded as a plain string, but "which package, which class" can.
 */
export type EncodedSpec =
  | { mode: 'static'; nsURI: string; className: string }
  | { mode: 'dynamic'; ecoreFilePath: string; className: string };

export function encodeStaticSpec(eClass: EClass, pkg: EPackage): EncodedSpec {
  return { mode: 'static', nsURI: pkg.getNsURI() ?? '', className: eClass.getName() ?? '' };
}

export function encodeDynamicSpec(eClass: EClass, ecoreFilePath: string): EncodedSpec {
  return { mode: 'dynamic', ecoreFilePath, className: eClass.getName() ?? '' };
}

/**
 * Re-resolves a real EClass fresh from `uri`'s own fragment - static mode via the shared
 * runtime.packageRegistry (the same registry "New Model Instance" itself read from when the
 * class was first picked), dynamic mode by re-loading the same .ecore file locally
 * (loadLocalEcorePackage's own, already-established mechanism). Returns undefined if the URI
 * carries no spec at all, or if re-resolution genuinely fails (e.g. the class or package no
 * longer exists) - the caller is responsible for producing a clear error in that case, not this
 * function itself.
 *
 * The fragment, not the query string, deliberately: a real, confirmed regression the query-string
 * version caused - @typemf/core's own URI class (used once InstanceEditorProvider hands this same
 * uri.toString() to resourceSet.createResource()) is deliberately minimal, with no concept of a
 * query string at all (see its own doc comment); everything before "#" becomes part of `path`, so
 * the encoded spec's own "." characters (e.g. inside a real nsURI like
 * "http://www.eclipse.org/emf/2002/Ecore") corrupted getFileExtension()'s result, breaking
 * ResourceFactory lookup for every new instance. @typemf/core's URI already correctly separates
 * out a fragment via "#", so the exact same carry-the-spec-in-the-uri-itself design (see
 * buildNewInstanceUri's own reasoning for why a shared, in-memory side channel was replaced in
 * the first place) now uses the one URI component @typemf/core actually understands.
 *
 * Takes `{ fragment }`, not a real vscode.Uri, deliberately - the only thing this ever used, and
 * narrowing it is what makes this genuinely unit-testable without a real VS Code runtime present,
 * same reasoning as handleGetObjectRequest's own `{ objectIds }` narrowing and
 * loadLocalEcorePackage's own `{ fsPath }` narrowing.
 */
export async function resolveNewInstanceSpec(uri: { fragment: string | undefined }, runtime: TypeMfRuntimeApi): Promise<EClass | undefined> {
  const raw = uri.fragment;
  if (!raw) return undefined;

  let encoded: EncodedSpec;
  try {
    encoded = JSON.parse(raw) as EncodedSpec;
  } catch {
    return undefined;
  }

  if (encoded.mode === 'static') {
    const pkg = runtime.packageRegistry.getPackage(encoded.nsURI);
    const classifier = pkg?.getEClassifier(encoded.className);
    return isEClass(classifier) ? classifier : undefined;
  }

  const pkg = await loadLocalEcorePackage({ fsPath: encoded.ecoreFilePath });
  const classifier = pkg.getEClassifier(encoded.className);
  return isEClass(classifier) ? classifier : undefined;
}
