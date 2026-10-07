import { EClass, EPackageRegistryImpl, isEPackage, ResourceSetImpl, URI } from '@typemf/core';
import type { TypeMfRuntimeApi } from '@typemf/vscode-runtime';
import { basename } from 'node:path/posix';
import * as vscode from 'vscode';
import { handleAncestorChainRequest } from './handle-ancestor-chain-request.js';
import { handleApplyEditRequest } from './handle-apply-edit-request.js';
import { handleConcreteSubtypesRequest } from './handle-concrete-subtypes-request.js';
import { handleCreateChildRequest } from './handle-create-child-request.js';
import { handleReferenceCandidatesRequest } from './handle-reference-candidates-request.js';
import { browseExternalReferenceCandidates } from './browse-external-reference.js';
import { handleGetObjectRequest } from './handle-get-object-request.js';
import { handleReadyMessage } from './handle-ready-message.js';
import {
  isAncestorChainRequest,
  isApplyEditRequest,
  isConcreteSubtypesRequest,
  isCreateChildRequest,
  isEditRelayFailedMessage,
  isGetObjectRequest,
  isBrowseExternalReferenceRequest,
  isReadyMessage,
  isReferenceCandidatesRequest,
  SettingsMessage,
} from './host-message-protocol.js';
import { EditHistory } from './edit-history.js';
import { InstanceDocument } from './instance-document.js';
import { resolveNewInstanceSpec } from './new-instance-spec-uri.js';
import { registerIfNew } from './register-if-new.js';
import { resolveDocumentIdentity } from './resolve-document-identity.js';
import { resolveMissingPackages } from './resolve-missing-packages.js';
import { UndoableEdit } from './undoable-edit.js';

/** A file's modification time, or undefined if it cannot be read (e.g. it does not exist). */
async function mtimeOf(uri: vscode.Uri): Promise<number | undefined> {
  try {
    return (await vscode.workspace.fs.stat(uri)).mtime;
  } catch {
    return undefined;
  }
}

/** The standard VS Code webview nonce pattern (a random string, gating which <script> tags the
 *  CSP allows to run) - not cryptographic, just needs to be unpredictable per render. */
function randomNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  return nonce;
}

/** The "Show derived features" setting's own current value - off by default (see package.json's
 *  own configuration contribution for the full description of why). */
function readShowDerivedFeatures(): boolean {
  return vscode.workspace.getConfiguration('typemf').get<boolean>('showDerivedFeatures', false);
}

export class InstanceEditorProvider implements vscode.CustomEditorProvider<InstanceDocument> {
  static readonly viewType = 'typemf.instanceEditor';
  /**
   * A second, dedicated viewType solely so *.ecore files can be registered at "default" priority
   * without also making this the default editor for *.xmi and (especially) *.json too - package.json's
   * own "priority" is set once per customEditors entry, not per selector pattern within one,
   * so a single, shared entry can't give *.ecore a different priority from the other two. *.json
   * in particular is far too generic a pattern to ever default to this editor workspace-wide
   * (every tsconfig.json and package.json would open here instead of the normal JSON editor).
   * Both viewTypes resolve through the exact same InstanceEditorProvider instance (see
   * extension.ts's own registration) - neither openCustomDocument nor resolveCustomEditor care
   * which viewType they were reached through at all.
   */
  static readonly ecoreDefaultViewType = 'typemf.instanceEditor.ecoreDefault';

  private readonly changeEmitter = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<InstanceDocument>>();
  private readonly panels = new Map<InstanceDocument, Set<vscode.WebviewPanel>>();
  readonly onDidChangeCustomDocument = this.changeEmitter.event;

  constructor(
    private readonly runtime: TypeMfRuntimeApi,
    private readonly extensionUri: vscode.Uri
  ) {}

  async openCustomDocument(
    uri: vscode.Uri,
    openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<InstanceDocument> {
    // Hot exit / crash recovery (ED-02): openContext.backupId names a real file on disk holding
    // whatever backupCustomDocument last wrote for this exact document - possibly-unsaved edits
    // that would otherwise be silently lost, including for an untitled document, which still
    // reaches this same uri.scheme === 'untitled' branch on restore and, without this check, used
    // to always rebuild a brand new, empty instance from the uri's own new-instance spec instead
    // (openNewInstance) - discarding the backup outright rather than ignoring it for lack of one.
    if (openContext.backupId) return this.openFromContent(uri, vscode.Uri.parse(openContext.backupId));
    return uri.scheme === 'untitled' ? this.openNewInstance(uri) : this.openFromContent(uri, uri);
  }

  /**
   * The spec travels in uri's own fragment (see new-instance-spec-uri.ts's own reasoning) - no
   * shared, in-memory side channel at all, replacing an earlier Map-based design that failed
   * repeatedly in real testing even after a URI-matching fix, strongly suggesting a structural
   * cause rather than a simple string-comparison bug.
   */
  private async openNewInstance(uri: vscode.Uri): Promise<InstanceDocument> {
    const eClass = await resolveNewInstanceSpec(uri, this.runtime);
    if (!eClass) {
      throw new Error(
        `'${uri.toString()}' has no new-instance spec in its own fragment - it must be opened via the "TypeMF: New Model Instance" command, not directly.`
      );
    }

    const pkg = eClass.getEPackage();
    const factory = pkg?.getEFactoryInstance();
    if (!pkg || !factory) {
      throw new Error(
        `'${eClass.getName()}''s EPackage has no EFactoryInstance registered - cannot construct a root instance.`
      );
    }
    // Registered into the shared, global package registry here, not just this one document's own
    // - a real, confirmed regression this fixes: saving a new instance of a DYNAMIC model (one
    // resolveNewInstanceSpec re-loaded locally, via loadLocalEcorePackage, never touching this
    // shared registry at all) triggers this editor's own "reopen with the right editor after
    // save" fix (saveCustomDocumentAs's own vscode.openWith call) - which goes through
    // openCustomDocument again, and since the file is real now (not untitled:), through
    // openFromContent, not back through here. That flow resolves referenced metamodels
    // against this SAME shared registry, found this package missing (never having been told about
    // it), and fell back to the missing-package QuickPick - which, triggered from inside an
    // automatic, programmatic reopen rather than a direct user action, had nothing to resolve it
    // and reported cancelled.
    //
    // Only when nothing is registered under this nsURI yet (ED-06, see registerIfNew). A
    // statically registered package is already here, so this is a no-op for that case; only the
    // dynamic one actually needed registering at all, and only the first time.
    registerIfNew(this.runtime.packageRegistry, pkg);
    // Uniform regardless of static/dynamic (the whole point of that framing): every EPackage,
    // generated or dynamically loaded, already has a real, working EFactoryInstance.
    const root = factory.create(eClass);

    const documentRegistry = new EPackageRegistryImpl();
    documentRegistry.register(pkg);
    const resourceSet = new ResourceSetImpl(
      documentRegistry,
      this.runtime.resourceFactoryRegistry,
      this.runtime.uriConverterRegistry
    );
    // The fragment only ever mattered for resolveNewInstanceSpec, above - stripped here before it
    // becomes @typemf/core's own, internal resource URI, so nothing downstream (a save path, a
    // future re-derived extension lookup) ever has to deal with it again. document.uri itself
    // deliberately keeps the ORIGINAL uri, fragment included: VS Code requested this exact URI in
    // openCustomDocument, and changing what CustomDocument.uri reports back risks breaking VS
    // Code's own document-identity bookkeeping - unlike the resource's own URI, this one is never
    // ours to rewrite. The display title is unaffected either way, since VS Code derives it from
    // the path, not the fragment.
    const resource = resourceSet.createResource(URI.parse(uri.with({ fragment: '' }).toString()));
    resource.getContents().add(root);

    return new InstanceDocument(uri, resourceSet, resource);
  }

  /**
   * Loads a serialized resource from contentUri - either `uri` itself, for a normal open, or a
   * hot-exit backup's own real file (named by openContext.backupId) instead, for either an
   * existing document whose last save predates its own crash or an untitled one that never had a
   * real file at all (see openCustomDocument's own reasoning, ED-02) - and gives the result the
   * SAME identity `uri` would always have gotten (resolveDocumentIdentity), regardless of which
   * one content actually came from, so every save/revert after this one behaves exactly as if
   * nothing had happened.
   */
  private async openFromContent(uri: vscode.Uri, contentUri: vscode.Uri): Promise<InstanceDocument> {
    const identityUri = resolveDocumentIdentity(uri.scheme, uri.fsPath, uri.with({ fragment: '' }).toString());
    const bytes = await vscode.workspace.fs.readFile(contentUri);
    const restoringFromBackup = contentUri.toString() !== uri.toString();

    const documentRegistry = new EPackageRegistryImpl();
    const resourceSet = new ResourceSetImpl(
      documentRegistry,
      this.runtime.resourceFactoryRegistry,
      this.runtime.uriConverterRegistry
    );
    // A tracked-but-unloaded Resource - used first just to reach its own serializer for the peek
    // below, then loaded for real once documentRegistry is fully resolved. One Resource, not two.
    const resource = resourceSet.createResource(identityUri);
    // Temporarily pointed at the backup's own real file for the load itself - exactly the same
    // swap-then-restore pattern backupCustomDocument itself already uses - then restored to
    // identityUri below, once loaded, so nothing downstream ever sees the backup's path at all.
    if (restoringFromBackup) resource.setURI(URI.createFileURI(contentUri.fsPath));

    const needed = await resource.getSerializer().peekReferencedNsURIs(bytes);
    const missing: string[] = [];
    for (const nsURI of needed) {
      const pkg = this.runtime.packageRegistry.getPackage(nsURI);
      if (pkg) documentRegistry.register(pkg);
      else missing.push(nsURI);
    }

    if (missing.length > 0) {
      const resolvedMissing = await resolveMissingPackages(missing);
      if (!resolvedMissing) {
        throw new Error(`'${uri.fsPath}': cancelled - not every referenced metamodel was resolved.`);
      }
      for (const pkg of resolvedMissing.values()) documentRegistry.register(pkg);
    }

    await resource.load();
    if (restoringFromBackup) resource.setURI(identityUri);

    // When the loaded root is itself an EPackage (a .ecore file, e.g. Ecore.ecore itself) whose
    // own nsURI matches an already-registered, real package, give the root that same real
    // factory rather than leaving it with none. This isn't about the root's own construction (its
    // own classifiers were already constructed via the real factory, since their own eClass -
    // "EClass", "EAttribute", ... - is that already-registered package's own, always real) - it's
    // about a real, confirmed cascade this fixes: the webview's own eagerness rule (see
    // SnapshotSerializer's needsEagerOwnFeatures) checks a classifier's *containing package's*
    // factory to decide whether that classifier needs its own structural references resolved
    // eagerly. Without this, every one of Ecore.ecore's own ~20+ classifiers (contained by this
    // freshly-loaded root, which had no factory of its own) looked exactly like the genuinely
    // dynamic case that rule exists for, triggering a cascading, sequential storm of real round
    // trips for a file that should have stayed almost entirely well-known and local.
    const root = resource.getContents().isEmpty() ? undefined : resource.getContents().get(0);
    if (isEPackage(root) && !root.getEFactoryInstance()) {
      const knownNsURI = root.getNsURI();
      const known = knownNsURI ? documentRegistry.getPackage(knownNsURI) : undefined;
      const knownFactory = known?.getEFactoryInstance();
      if (known && known !== root && knownFactory) {
        root.setEFactoryInstance(knownFactory);
      }
    }

    const document = new InstanceDocument(uri, resourceSet, resource);
    // A restored backup already differs from the file on disk.
    if (restoringFromBackup) document.history = new EditHistory(true);
    return document;
  }

  async resolveCustomEditor(
    document: InstanceDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // The tree/properties rendering itself is still a stub (STILL a separate, not-yet-designed
    // piece) - but the getObject message handling below is real, functional wiring: it's what
    // makes the webview side's HostMessageUriConverter (see host-message-uri-converter.ts)
    // actually work once a real webview app exists to send requests through it, not itself
    // waiting on the rendering design.
    webviewPanel.webview.onDidReceiveMessage((message: unknown) => {
      if (isReadyMessage(message)) {
        void webviewPanel.webview.postMessage(handleReadyMessage(document, readShowDerivedFeatures()));
        return;
      }
      if (isGetObjectRequest(message)) {
        const response = handleGetObjectRequest(message, document);
        void webviewPanel.webview.postMessage(response);
        return;
      }
      if (isApplyEditRequest(message)) {
        // Each successful edit is announced as a CustomDocumentEditEvent (marks the document
        // dirty and puts one step on VS Code's undo stack) - onEdit is only called on a genuine
        // success, an ApplyEditError means nothing on the real object actually changed.
        const response = handleApplyEditRequest(message, document, (edit) => this.announceEdit(document, edit));
        void webviewPanel.webview.postMessage(response);
        return;
      }
      if (isConcreteSubtypesRequest(message)) {
        void webviewPanel.webview.postMessage(handleConcreteSubtypesRequest(message, document));
        return;
      }
      if (isAncestorChainRequest(message)) {
        void webviewPanel.webview.postMessage(handleAncestorChainRequest(message, document));
        return;
      }
      if (isCreateChildRequest(message)) {
        const response = handleCreateChildRequest(message, document, (edit) => this.announceEdit(document, edit));
        void webviewPanel.webview.postMessage(response);
        return;
      }
      if (isReferenceCandidatesRequest(message)) {
        void webviewPanel.webview.postMessage(handleReferenceCandidatesRequest(message, document));
        return;
      }
      if (isBrowseExternalReferenceRequest(message)) {
        const { requestId, typeId } = message;
        void (async () => {
          const declaredType = document.objectIds.objectFor(typeId) as EClass | undefined;
          if (!declaredType) {
            void webviewPanel.webview.postMessage({
              type: 'typemf/browseExternalReferenceError',
              requestId,
              message: `No class known for id '${typeId}'.`,
            });
            return;
          }
          try {
            const { candidateIds, cancelled } = await browseExternalReferenceCandidates(document, declaredType);
            void webviewPanel.webview.postMessage({
              type: 'typemf/browseExternalReferenceResult',
              requestId,
              candidateIds,
              cancelled,
            });
          } catch (err) {
            void webviewPanel.webview.postMessage({
              type: 'typemf/browseExternalReferenceError',
              requestId,
              message: (err as Error).message,
            });
          }
        })();
        return;
      }
      if (isEditRelayFailedMessage(message)) {
        // See EditRelayFailedMessage's own reasoning - a real edit already happened in the
        // webview but never reached this document at all, so the two are now out of sync. A
        // visible notification is the honest response; there is nothing to safely recover here.
        void vscode.window.showErrorMessage(`TypeMF: an edit could not be saved to the document. ${message.reason}`);
      }
    });

    // A live change to "Show derived features" (e.g. from the Settings UI, while this document is
    // already open) is pushed to this one webview as a SettingsMessage - InitMessage's own
    // showDerivedFeatures field only ever covers the one-time, already-ready moment. Scoped and
    // disposed with this webview's own lifetime, not left running after the panel closes.
    const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration('typemf.showDerivedFeatures')) return;
      const settingsMessage: SettingsMessage = {
        type: 'typemf/settings',
        showDerivedFeatures: readShowDerivedFeatures(),
      };
      void webviewPanel.webview.postMessage(settingsMessage);
    });
    if (document.uri.scheme !== 'untitled' && document.lastKnownMtime === undefined) {
      document.lastKnownMtime = await mtimeOf(document.uri);
      this.watchForExternalChanges(document);
    }

    const documentPanels = this.panels.get(document) ?? new Set<vscode.WebviewPanel>();
    documentPanels.add(webviewPanel);
    this.panels.set(document, documentPanels);
    webviewPanel.onDidDispose(() => {
      configListener.dispose();
      documentPanels.delete(webviewPanel);
      if (documentPanels.size === 0) this.panels.delete(document);
    });

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'dist-webview')],
    };
    webviewPanel.webview.html = this.renderWebviewHtml(webviewPanel.webview);
  }

  /**
   * Puts `edit` on VS Code's undo stack. Undo and redo change the real objects, then reload every
   * webview of the document: a webview only ever holds its own, lazily built copy of the objects
   * and cannot be patched reliably, so it rebuilds from the host's (unchanged) object ids and
   * restores its own selection and expansion state (see App.tsx).
   */
  private announceEdit(document: InstanceDocument, edit: UndoableEdit): void {
    document.history.recordEdit();
    const generation = document.generation;
    // An edit recorded before the document was reloaded from its file (revert, external change)
    // refers to objects that no longer exist, so undoing or redoing it can only be skipped.
    const stale = (): boolean => {
      if (document.generation === generation) return false;
      void vscode.window.showWarningMessage(
        'TypeMF: this change predates the last reload of the document from disk and can no longer be undone or redone.'
      );
      return true;
    };
    this.changeEmitter.fire({
      document,
      label: edit.label,
      undo: () => {
        if (stale()) return;
        edit.undo();
        document.history.undone();
        this.reloadWebviews(document);
      },
      redo: () => {
        if (stale()) return;
        edit.redo();
        document.history.redone();
        this.reloadWebviews(document);
      },
    });
  }

  private reloadWebviews(document: InstanceDocument): void {
    for (const panel of this.panels.get(document) ?? []) {
      panel.webview.html = this.renderWebviewHtml(panel.webview);
    }
  }

  /** The real webview HTML - the confirmed, standard VS Code pattern (nonce-gated script,
   *  webview.cspSource-scoped CSP, asWebviewUri for every local resource) rather than anything
   *  improvised, since a webview's content security policy silently drops anything that doesn't
   *  follow it exactly. */
  private renderWebviewHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist-webview', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'dist-webview', 'styles.css'));
    const nonce = randomNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri.toString()}" rel="stylesheet">
  <title>TypeMF Instance Editor</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri.toString()}"></script>
</body>
</html>`;
  }

  async saveCustomDocument(document: InstanceDocument, _token: vscode.CancellationToken): Promise<void> {
    await this.saveAndRecord(document);
  }

  /** Saves, then records the new clean state and file time so the document's own write is not
   *  mistaken for an external change (see watchForExternalChanges). */
  private async saveAndRecord(document: InstanceDocument): Promise<void> {
    document.saving = true;
    try {
      await document.resource.save();
      document.history.markSaved();
      document.lastKnownMtime = await mtimeOf(document.uri);
    } finally {
      document.saving = false;
    }
  }

  async saveCustomDocumentAs(
    document: InstanceDocument,
    destination: vscode.Uri,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Reuses Resource.save()'s own, already-correct logic (going through the proper
    // UriConverter) by pointing the resource at the new destination, permanently - a real,
    // confirmed bug: this used to restore the resource's original URI in a `finally` block after
    // saving, on the theory that the destination was a one-off target. It isn't: per VS Code's
    // own CustomEditorProvider contract, a successful "Save As" makes `destination` this
    // document's real, ongoing identity from here on, so every *subsequent* plain
    // saveCustomDocument (a normal Ctrl+S) needs the resource already pointed there - restoring
    // the old URI meant every save after the first one silently targeted the original (often
    // untitled:) URI instead, never reaching the real file on disk again. document.uri is updated
    // too, for the same reason (see its own, now-mutable declaration in instance-document.ts).
    document.resource.setURI(resolveDocumentIdentity(destination.scheme, destination.fsPath, destination.toString()));
    document.uri = destination;
    await this.saveAndRecord(document);
    this.watchForExternalChanges(document);

    // Re-opens explicitly with this editor, deliberately deferred (not awaited, not run
    // synchronously here) - a real, reported problem: this extension's own customEditors
    // contribution registers at "option" priority (not "default"), the right choice for *.json
    // in particular (a generic extension - making this editor the default for every .json file
    // in a workspace, tsconfig.json and package.json included, would be far more disruptive than
    // the problem being solved). But that same "option" priority is exactly why VS Code's own
    // post-save-as reopen logic - which runs AFTER saveCustomDocumentAs itself resolves, not
    // before - falls back to the plain text/XML editor for the newly-saved file: nothing tells it
    // this file should keep using THIS editor instead. Deferred to the next tick so this runs
    // after, not racing, whatever VS Code's own reopen does - correcting it back afterward,
    // rather than trying to preempt it.
    setTimeout(() => {
      void vscode.commands.executeCommand('vscode.openWith', destination, InstanceEditorProvider.viewType);
    }, 0);
  }

  async revertCustomDocument(document: InstanceDocument, _token: vscode.CancellationToken): Promise<void> {
    await this.reloadFromDisk(document);
  }

  /**
   * Discards the in-memory document and loads the file again. Resource.load() already does a clean
   * discard-and-replace (clears getContents(), then repopulates from a fresh deserialize), reusing
   * the documentRegistry resolved when the document was first opened - it does not re-run
   * missing-package resolution (an accepted limitation: the set of referenced metamodels changing
   * between open and reload is an edge case). Every object is new afterwards, so the issued object
   * ids are dropped and the webviews built on them are reloaded.
   */
  private async reloadFromDisk(document: InstanceDocument): Promise<void> {
    await document.resource.load();
    document.objectIds.clear();
    document.generation++;
    document.history.reset();
    document.lastKnownMtime = await mtimeOf(document.uri);
    this.reloadWebviews(document);
  }

  /**
   * Reloads a document that was changed outside the editor (git checkout, another editor, a
   * build step) - unless it has unsaved changes, which are kept: VS Code reports the conflict
   * itself when saving over a newer file.
   */
  private watchForExternalChanges(document: InstanceDocument): void {
    if (document.uri.scheme === 'untitled') return;
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(vscode.Uri.joinPath(document.uri, '..'), basename(document.uri.path))
    );
    const onChange = (): void => {
      if (document.saving || document.reloading || document.history.isDirty()) return;
      void (async () => {
        document.reloading = true;
        try {
          const mtime = await mtimeOf(document.uri);
          if (mtime === undefined || mtime === document.lastKnownMtime) return;
          await this.reloadFromDisk(document);
          vscode.window.setStatusBarMessage(
            `TypeMF: reloaded ${basename(document.uri.path)} after an external change`,
            4000
          );
        } catch (err) {
          void vscode.window.showWarningMessage(
            `TypeMF: could not reload ${basename(document.uri.path)} after an external change: ${(err as Error).message}`
          );
        } finally {
          document.reloading = false;
        }
      })();
    };
    watcher.onDidChange(onChange);
    watcher.onDidCreate(onChange);
    document.setFileWatcher(watcher);
  }

  async backupCustomDocument(
    document: InstanceDocument,
    context: vscode.CustomDocumentBackupContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    const originalUri = document.resource.getURI();
    document.resource.setURI(URI.createFileURI(context.destination.fsPath));
    try {
      await document.resource.save();
    } finally {
      document.resource.setURI(originalUri);
    }
    return {
      id: context.destination.toString(),
      delete: () => {
        void vscode.workspace.fs.delete(context.destination); // best-effort, fire-and-forget cleanup
      },
    };
  }
}
