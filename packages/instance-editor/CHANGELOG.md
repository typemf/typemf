# instance-editor

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
