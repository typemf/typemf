# @typemf/core

## 0.7.0

### Minor Changes

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Add `EObject.eResource()` - the Resource an object is part of, if any: its own if it's a root, otherwise its nearest containing root's. Matches real EMF's own public API, which this project previously worked around with a free function (`getResourceOf`, still exported, now a thin wrapper) kept outside the metamodel specifically to avoid this.

  `@typemf/xmi` and `@typemf/json` now call `target.eResource()` directly instead of importing `getResourceOf`.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix every generated package (including `@typemf/core`'s own self-hosted Ecore metamodel) requiring `{Pkg}PackageImpl.eINSTANCE`/`.init()` to be touched before anything else could be used - `new EClassImpl().setName('Book')`, or any other direct construction of a generated class, previously threw `getEcorePackageRef() called before the EcorePackage singleton finished constructing itself.`

  The package singleton is now constructed lazily, on first use, through an initializer each `{Pkg}PackageImpl.ts` registers as a side effect of its own module being loaded - no code anywhere needs to explicitly reference `eINSTANCE` first just to make the metamodel exist. `@typemf/core`'s `package.json` is now marked `"sideEffects": true` so a bundler doesn't tree-shake that registration away.

  Also adds `{Factory}Impl.eINSTANCE` (e.g. `EcoreFactoryImpl.eINSTANCE`), matching EMF's own factory singleton accessor alongside the package's.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix missing notifications: several EObjectImpl mutations updated storage silently, with no `onDidChange` notification, even though a real change happened.

  - `eInverseAdd` (an opposite reference gaining a value) now fires `ADD`/`SET`.
  - Clearing an opposite or an old container's reference during a move or detach now fires `REMOVE`/`SET` (one shared internal method, covering `eInverseRemove`, `eBasicMoveInto` and `eBasicDetachFromContainer` alike).
  - `EList.move(fromIndex, toIndex)` is new: reorders in place and fires a single `MOVE` notification instead of requiring a `REMOVE`+`ADD` pair to reorder at all.

  `instance-editor`'s write path (`SnapshotSerializer`/`EditRelay`) needed a matching fix: making these mutations observable exposed a latent gap where reconstructing one object's containment list could fire an opposite update on an already-reconstructed sibling, which the write path would relay to the host as if it were a real edit. `EditRelay` now suppresses relaying for the whole span of a snapshot's reconstruction, not just the object currently being populated.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Support relative references between documents - the form EMF writes by default for a cross-document reference between files in the same workspace (e.g. `href="other.xmi#Dune"`), instead of requiring (and always writing) an absolute URI.

  - `URI.parse()` no longer throws on a string with no scheme; it returns a relative `URI` (`isRelative()` true, `getScheme()` undefined). New `resolve(base)` makes it absolute against a base document's URI; new `deresolve(base)` computes the shortest relative form, the inverse of `resolve()`.
  - `@typemf/xmi` now resolves a relative `href` - both the `<feature href="..."/>` child-element form and the same-attribute form - against the document's own URI when reading, and writes a relative `href` (deresolved against the document's own URI) when saving a cross-document reference, instead of always reading/writing an absolute one.

  Loading a document with a relative, EMF-style `href` previously threw `Not a valid absolute URI`.

### Patch Changes

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix `eGet`/`eSet`/`eIsSet`/`eUnset` (every generated class, and `DynamicEObjectImpl`) accepting a feature that doesn't belong to the object's class and silently dispatching on its numeric id instead. Two unrelated classes can each declare a feature with the same id (e.g. both the first attribute of their own class); passing one class's feature to an instance of the other previously read or overwrote whichever of its own features happened to share that id.

  `eGet`/`eSet`/`eIsSet`/`eUnset` now throw `The feature '<name>' is not a valid feature` (matching EMF) when the feature isn't in `eClass().getEAllStructuralFeatures()`, instead of accepting it.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix `EClassifier.isInstance(object)`, which previously returned `object instanceof EObjectImpl` for every classifier - `true` for any EObject regardless of its actual class, `false` for every data value (e.g. `EString.isInstance('text')` was `false`).

  `EClass.isInstance(object)` now checks `object` is an `EObject` whose class this class is a supertype of (`isSuperTypeOf`). `EDataType.isInstance(object)` checks `object`'s TypeScript type against the data type's known built-in Ecore name (`EString`, `EInt`/`ELong`/`EDouble`/`EFloat`/`EShort`/`EByte` and their `*Object` forms, `EBigInteger`, `EBoolean`/`EBooleanObject`, `EDate`); a custom data type with no special-cased name accepts any defined value, matching EMF's own permissive default for a type with no known Java class.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix a dynamic instance losing data when its `EClass` has two supertypes that each declare a feature with the same raw `featureID` (e.g. `Movable.position` and `Named.label`, each `id=1` within their own declaring class) - `eSet` on one silently overwrote the other's stored value.

  `EClass.getFeatureID(feature)` now returns the feature's position in `getEAllStructuralFeatures()` (unique across the whole class, including the multiple-inheritance case) instead of the feature's own, per-declaring-class id; `getEStructuralFeature(number)` is its exact inverse. `DynamicEObjectImpl` keys its storage by this id.

  Generated (non-dynamic) classes are unaffected - the TypeScript generator only ever produces single-inheritance classes, so this collision could only happen for a dynamic `EClass` with genuine multiple `eSuperTypes`.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix `Resource.getContents()` not keeping content ownership consistent (EMF semantics: adding an object makes a resource its sole owner, and the list is unique):

  - Adding an object that is currently a root of a _different_ resource left it there too; it is now removed from that resource's contents first.
  - Adding an object that is currently contained in some other object's containment feature left it there too; it is now detached from that container first.
  - Adding the same root a second time duplicated it in the list; it is now a no-op.

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix `URI.createFileURI(path)` on a Windows-style path or a path with characters that need escaping: `createFileURI('C:\\Users\\a b\\m.xmi')` previously produced `file:///C:\Users\a b\m.xmi` - a mix of forward and backslashes with an un-encoded space, which `resolve()`/`deresolve()` (both split on `/`) and any consumer serializing the URI into text (e.g. an `href`) handled incorrectly or not at all.

  `createFileURI` now converts backslashes to forward slashes first (so a Windows `fsPath` becomes an ordinary absolute URI path, the same shape a POSIX path already had) and percent-encodes each path segment, leaving `:` unescaped so a drive letter still reads as `C:` rather than `C%3A` (matching Eclipse's own Windows file URIs). Decoding back to a native path at the filesystem boundary is unchanged - `@typemf/node`'s `fileURLToPath`-based conversion already handles it.

## 0.6.0

### Minor Changes

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
