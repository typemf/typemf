import * as vscode from 'vscode';
import { EncodedSpec } from './new-instance-spec.js';

export { encodeDynamicSpec, encodeStaticSpec, resolveNewInstanceSpec } from './new-instance-spec.js';

/**
 * Builds the untitled:// URI a new instance opens at, with its own spec encoded directly into
 * the fragment - deliberately not a side-channel Map keyed by the URI (the earlier design, which
 * failed repeatedly in real testing: whether the true cause was untitled: URIs losing their
 * remote authority on the way to openCustomDocument, the provider being a different JS instance
 * than the one the command ran against, or something else entirely, this sidesteps the whole
 * class of problem rather than chasing the exact one - the spec now travels with the URI itself,
 * needing no shared, in-memory state to survive the round trip at all).
 *
 * The fragment, not the query string - a real, confirmed regression the query-string version
 * caused once this same uri.toString() reached @typemf/core's own, deliberately minimal URI
 * class (no concept of a query string at all - see resolveNewInstanceSpec's own reasoning for the
 * full story). Passed as a plain, un-encoded string, deliberately: vscode.Uri's own `fragment`
 * property is already the decoded value on both ends of this round trip (building it here, and
 * reading uri.fragment back in resolveNewInstanceSpec) - VS Code itself handles percent-encoding
 * only in uri.toString()'s own string form, which nothing here needs to parse.
 */
export function buildNewInstanceUri(folderUri: vscode.Uri, fileName: string, encoded: EncodedSpec): vscode.Uri {
  return vscode.Uri.joinPath(folderUri, fileName).with({
    scheme: 'untitled',
    fragment: JSON.stringify(encoded),
  });
}
