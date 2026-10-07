import { URI } from '@typemf/core';

/**
 * The resource's real, ongoing identity once loaded - a file path for a 'file:' document, the
 * document's own uri otherwise (fragment stripped - matching openNewInstance's own, pre-existing
 * choice: an untitled document has no real file yet, so its own uri has to stand in for one).
 * Doesn't depend on where the initial content actually came from: restoring from a hot-exit
 * backup still has to land on the exact same identity a normal open would have, so every
 * save/revert after this one behaves exactly as if nothing had happened.
 */
export function resolveDocumentIdentity(scheme: string, fsPath: string, uriStringWithoutFragment: string): URI {
  return scheme === 'file' ? URI.createFileURI(fsPath) : URI.parse(uriStringWithoutFragment);
}
