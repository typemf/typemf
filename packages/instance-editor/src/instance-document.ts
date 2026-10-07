import { Resource, ResourceSet } from '@typemf/core';
import * as vscode from 'vscode';
import { EditHistory } from './edit-history.js';
import { ObjectIdMap } from './object-id-map.js';

/**
 * Deliberately holds no "static" vs "dynamic" flag - matches the design finding that the
 * distinction only ever matters at construction time (root-picking for a new instance,
 * package-resolution for an existing file), never afterward. Once a root EObject exists inside
 * `resource`, rendering, editing, and saving are all completely mode-agnostic.
 *
 * `resourceSet` carries this document's own EPackageRegistry - assembled specifically for this
 * document by InstanceEditorProvider (whatever's already in the shared runtime.packageRegistry,
 * plus whatever got resolved dynamically), never the shared registry itself. See the design
 * discussion this package came out of for why a dynamically-picked .ecore file stays local to one
 * document rather than being globally registered.
 */
export class InstanceDocument implements vscode.CustomDocument {
  /**
   * One per document, never shared - per the explicit design decision. IDs from one open
   * document can never collide with or leak into another; the webview relay for this document
   * only ever consults this instance's own map.
   */
  readonly objectIds = new ObjectIdMap();

  /** Bumped whenever the resource is reloaded from its file (revert, external change): every
   *  object, and so every undo step recorded before that, belongs to a previous generation. */
  generation = 0;

  /** Whether there are unsaved changes - see EditHistory. */
  history = new EditHistory();

  /** The file's modification time as of our own last load or save; a change event whose file
   *  still has this time is our own write, not an external one. */
  lastKnownMtime: number | undefined;
  /** True while our own save is writing, so its file events are not mistaken for external ones. */
  saving = false;
  reloading = false;
  private fileWatcher: { dispose(): void } | undefined;

  constructor(
    // Deliberately NOT readonly - a real, confirmed bug: a brand-new instance opens at an
    // untitled: URI, and its first real save goes through saveCustomDocumentAs, not
    // saveCustomDocument; that only updates this document's own identity for good if something
    // here actually lets it. Without this, every *subsequent* save (Ctrl+S again) would still
    // target the original untitled: URI - resource.save() uses whatever URI the resource itself
    // currently holds, and nothing had ever moved it off the original one permanently - so the
    // edit looked like it saved (no error) but never actually reached the real file on disk. See
    // saveCustomDocumentAs's own reasoning in instance-editor-provider.ts.
    public uri: vscode.Uri,
    public readonly resourceSet: ResourceSet,
    public readonly resource: Resource
  ) {}

  /** Replaces the watcher (a "Save As" moves the document to another file). */
  setFileWatcher(watcher: { dispose(): void } | undefined): void {
    this.fileWatcher?.dispose();
    this.fileWatcher = watcher;
  }

  dispose(): void {
    this.setFileWatcher(undefined);
  }
}
