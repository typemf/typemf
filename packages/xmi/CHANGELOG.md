# @typemf/xmi

## 0.7.0

### Patch Changes

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Add `EObject.eResource()` (CORE-08) - the Resource an object is part of, if any: its own if it's a root, otherwise its nearest containing root's. Matches real EMF's own public API, which this project previously worked around with a free function (`getResourceOf`, still exported, now a thin wrapper) kept outside the metamodel specifically to avoid this.

  `@typemf/xmi` and `@typemf/json` now call `target.eResource()` directly instead of importing `getResourceOf`.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix loading not reporting problems the EMF way (XMI-04, JSON-04): both formats now record a diagnostic on `Resource.getErrors()`/`getWarnings()` and keep loading the rest of the document, instead of silently dropping data or throwing and aborting the whole load.

  - An unknown attribute/element (XMI) or key (JSON) is a warning - the value is dropped (as before; it would be lost on the next save regardless), but it's now visible instead of silent.
  - An unresolved same-document/same-resource reference is an error - the feature is left unset instead of the load throwing.
  - `@typemf/json` additionally reports invalid JSON, or a document missing a `$roots` array, as an error with zero roots instead of throwing a raw `SyntaxError`/`TypeError`.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Support relative references between documents - the form EMF writes by default for a cross-document reference between files in the same workspace (e.g. `href="other.xmi#Dune"`), instead of requiring (and always writing) an absolute URI.

  - `URI.parse()` no longer throws on a string with no scheme; it returns a relative `URI` (`isRelative()` true, `getScheme()` undefined). New `resolve(base)` makes it absolute against a base document's URI; new `deresolve(base)` computes the shortest relative form, the inverse of `resolve()`.
  - `@typemf/xmi` now resolves a relative `href` - both the `<feature href="..."/>` child-element form and the same-attribute form - against the document's own URI when reading, and writes a relative `href` (deresolved against the document's own URI) when saving a cross-document reference, instead of always reading/writing an absolute one.

  Loading a document with a relative, EMF-style `href` previously threw `Not a valid absolute URI`.

- Updated dependencies [[`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177)]:
  - @typemf/core@0.7.0

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

- Updated dependencies [[`5123e20`](https://github.com/typemf/typemf/commit/5123e20130003e8eb4cdc9dd64376e312cd197aa)]:
  - @typemf/core@0.6.0

## 0.5.1

### Patch Changes

- Updated dependencies []:
  - @typemf/core@0.5.1
