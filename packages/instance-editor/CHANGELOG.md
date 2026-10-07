# instance-editor

## 0.8.0

### Minor Changes

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - "Link external..." can now pick a candidate from any registered package (Ecore itself, or anything the `typemf.ecoreMappings` setting dynamically registers at activation), not just a file browsed from disk. When at least one package is registered, a picker lets you choose between them and "Browse for a file...", which falls back to the previous file-dialog behavior.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Add undo and redo to the instance editor. Every edit (setting or unsetting a value, adding or removing a list element, adding a child) is now one step on VS Code's undo stack, so Ctrl+Z / Ctrl+Y work and the dirty marker clears when you undo back to the saved state. After an undo or redo the editor reloads its view from the document and keeps the tree's selection and expanded nodes.

### Patch Changes

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Convert data values consistently and exactly.

  - `ELong`/`ELongObject` and `EBigInteger` values are now `bigint`, so 64-bit values no longer lose precision above 2^53; `EBigDecimal` values are strings holding the exact decimal; `EDate` values are `Date` and `EByteArray` values are `Uint8Array` (hexadecimal in documents). Generated types change accordingly. **Breaking:** code that reads or writes an `ELong` attribute now uses `bigint`.
  - `EFactory.createFromString()` throws for a literal that is not a valid value of the data type, including out-of-range integers, instead of returning `NaN` or a rounded number. Booleans are read case-insensitively, `INF`/`-INF`/`NaN` are accepted for floating-point types, and an enum literal is checked against the enum. `convertToString()` returns `undefined` for `undefined`/`null`.
  - New `createFromString(eDataType, literal)` and `convertToString(eDataType, value)` functions convert with the factory of the data type's package, as EMF's `EcoreUtil` does. XMI and JSON now use them for every attribute value, so every data type converts the same way in both formats, including custom data types with their own factory. An invalid value in a document is recorded in `getErrors()` and leaves the attribute unset instead of aborting the load or storing a wrong value. JSON writes values it cannot represent exactly (a `bigint`, `NaN`, `Infinity`, a `Date`, bytes) as strings.
  - `EClassifier.getDefaultValue()` returns `0n` for `ELong` and an enum's first literal for an enum. Generated defaults are checked: an invalid `defaultValueLiteral` of a primitive attribute is a generation error.
  - The instance editor edits `bigint` attributes in a text field.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix `openCustomDocument` ignoring `openContext.backupId`: after a crash or a VS Code restart with hot exit, an unsaved document (saved or still untitled) was silently reopened from its last-saved state, or as a brand new, empty instance, discarding the backup `backupCustomDocument` had already written for it. The backup's content is now loaded instead, while the document keeps the exact same identity (file path, or the untitled uri) a normal open would have given it.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix a new model instance silently replacing an already-registered package: `openNewInstance` registered its (possibly dynamically loaded) package in the shared runtime registry unconditionally, overwriting whatever another extension, or an earlier new instance of the same dynamic metamodel, had registered under the same nsURI. It now registers only when nothing is registered under that nsURI yet.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Keep the editor in sync with the file: reverting a document now reloads the editor view (it kept showing the discarded state before), and a document changed outside the editor (git checkout, another editor) is reloaded automatically unless it has unsaved changes. Undo steps recorded before such a reload are skipped with a warning instead of acting on objects that no longer exist.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Open and save documents on virtual file systems, e.g. GitHub repositories opened through vscode.dev or "Remote Repositories": the runtime now registers a `UriConverter` backed by `vscode.workspace.fs` instead of Node's `fs`, handling every absolute URI. The editor no longer turns every picked or "Save As" destination into a `file:` URI from its `fsPath`; a non-`file:` destination keeps its own URI.

## 0.7.0

### Patch Changes

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix missing notifications: several EObjectImpl mutations updated storage silently, with no `onDidChange` notification, even though a real change happened.

  - `eInverseAdd` (an opposite reference gaining a value) now fires `ADD`/`SET`.
  - Clearing an opposite or an old container's reference during a move or detach now fires `REMOVE`/`SET` (one shared internal method, covering `eInverseRemove`, `eBasicMoveInto` and `eBasicDetachFromContainer` alike).
  - `EList.move(fromIndex, toIndex)` is new: reorders in place and fires a single `MOVE` notification instead of requiring a `REMOVE`+`ADD` pair to reorder at all.

  `instance-editor`'s write path (`SnapshotSerializer`/`EditRelay`) needed a matching fix: making these mutations observable exposed a latent gap where reconstructing one object's containment list could fire an opposite update on an already-reconstructed sibling, which the write path would relay to the host as if it were a real edit. `EditRelay` now suppresses relaying for the whole span of a snapshot's reconstruction, not just the object currently being populated.

## 0.6.0

### Patch Changes

- [#5](https://github.com/typemf/typemf/pull/5) [`5123e20`](https://github.com/typemf/typemf/commit/5123e20130003e8eb4cdc9dd64376e312cd197aa) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix two related bugs around unresolved cross-document references (proxies):

  - Reading a feature of an unresolved proxy (e.g. `book.getAuthor().getName()` before the author's
    document has loaded) threw `Cannot read a feature of an unresolved proxy`. A proxy is now a
    real instance of the target class, created through its own factory, and returns that class's
    own normal default until resolved - no more throwing.
  - Adding an unresolved proxy to any reference that has an `eOpposite` threw for the same reason,
    which made loading a bidirectional cross-document reference fail outright (confirmed for XMI),
    and made opening a `.ecore` file with more than one classifier show only the first one in the
    TypeMF Instance Editor (the editor's own webview reconstructs containment children as
    unresolved proxies by default).
  - `ResourceSet.resolve()` located and returned the real, loaded object but never updated the
    reference that pointed at the proxy - a later read of the same feature still saw the stale
    proxy. New `ResourceSet.resolveFeature(container, feature)` resolves the current value and
    writes the resolved object back into `container`'s own feature, firing a `RESOLVE`
    notification.

  `ProxyEObjectImpl` is no longer exported; it is replaced by `createProxy()`/`getProxyURI()` in
  `@typemf/core`, used internally by `@typemf/xmi`, `@typemf/json` and `@typemf/generator`'s
  `.ecore` loader. Code that imported `ProxyEObjectImpl` directly should use these functions and
  the `EObject.eIsProxy()` check instead.

## 0.5.1

No changes in this release.
