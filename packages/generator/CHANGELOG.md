# @typemf/generator

## 0.7.0

### Patch Changes

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix every generated package (including `@typemf/core`'s own self-hosted Ecore metamodel) requiring `{Pkg}PackageImpl.eINSTANCE`/`.init()` to be touched before anything else could be used (CORE-01) - `new EClassImpl().setName('Book')`, or any other direct construction of a generated class, previously threw `getEcorePackageRef() called before the EcorePackage singleton finished constructing itself.`

  The package singleton is now constructed lazily, on first use, through an initializer each `{Pkg}PackageImpl.ts` registers as a side effect of its own module being loaded - no code anywhere needs to explicitly reference `eINSTANCE` first just to make the metamodel exist. `@typemf/core`'s `package.json` is now marked `"sideEffects": true` so a bundler doesn't tree-shake that registration away.

  Also adds `{Factory}Impl.eINSTANCE` (e.g. `EcoreFactoryImpl.eINSTANCE`), matching EMF's own factory singleton accessor alongside the package's.

- Updated dependencies [[`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177), [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177)]:
  - @typemf/core@0.7.0
  - @typemf/xmi@0.7.0
  - @typemf/node@0.7.0

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
  - @typemf/xmi@0.6.0
  - @typemf/node@0.6.0

## 0.5.1

### Patch Changes

- [#2](https://github.com/typemf/typemf/pull/2) [`522d426`](https://github.com/typemf/typemf/commit/522d426fd8de60f3427efa9cf26d194582176b83) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix generated TypeScript failing strict `tsc`/ESLint configs (`noImplicitOverride`, `@typescript-eslint/strictTypeChecked`/`stylisticTypeChecked`):

  - `*FactoryImpl.create()` now declares `override`, matching its base `EFactoryImpl.create()`.
  - Numeric ids (`getFeatureID()`, `getClassifierID()`) interpolated into thrown error messages are now wrapped in `String(...)`, satisfying `@typescript-eslint/restrict-template-expressions`.
  - Lazy list-cache initialization (`eBootstrapList`, many-valued feature getters) now uses `??=` instead of `if (!x) { x = ... }`, satisfying `@typescript-eslint/prefer-nullish-coalescing`.
  - `eBasicSetValue`'s `value` parameter, and the `Switch` class's stub `case*`/`defaultCase` parameters, are now named `_value`/`_object` instead of being marked with a `void` statement when genuinely unused - avoiding `@typescript-eslint/no-meaningless-void-operator` without disabling `noUnusedParameters`.
  - `*PackageImpl.ts` no longer unconditionally imports `EAttributeImpl`, `EReferenceImpl`, `EOperationImpl`, `EParameterImpl`, `EDataTypeImpl`, `EEnumImpl`, `EEnumLiteralImpl`, and `EAnnotationImpl` - each is only imported when the package actually contains that classifier/feature/annotation kind. `EFactoryImpl` is no longer imported at all, since it was never referenced in this file's body.

  Projects generating from a package with no enums, operations, annotations, or a class with zero features previously saw 1-3 `tsc` errors and dozens of ESLint errors in the generated output; all of the above are now clean by construction under a typical strict config.

- Updated dependencies []:
  - @typemf/core@0.5.1
  - @typemf/node@0.5.1
  - @typemf/xmi@0.5.1
