# @typemf/generator

## 0.8.0

### Minor Changes

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Convert data values consistently and exactly.

  - `ELong`/`ELongObject` and `EBigInteger` values are now `bigint`, so 64-bit values no longer lose precision above 2^53; `EBigDecimal` values are strings holding the exact decimal; `EDate` values are `Date` and `EByteArray` values are `Uint8Array` (hexadecimal in documents). Generated types change accordingly. **Breaking:** code that reads or writes an `ELong` attribute now uses `bigint`.
  - `EFactory.createFromString()` throws for a literal that is not a valid value of the data type, including out-of-range integers, instead of returning `NaN` or a rounded number. Booleans are read case-insensitively, `INF`/`-INF`/`NaN` are accepted for floating-point types, and an enum literal is checked against the enum. `convertToString()` returns `undefined` for `undefined`/`null`.
  - New `createFromString(eDataType, literal)` and `convertToString(eDataType, value)` functions convert with the factory of the data type's package, as EMF's `EcoreUtil` does. XMI and JSON now use them for every attribute value, so every data type converts the same way in both formats, including custom data types with their own factory. An invalid value in a document is recorded in `getErrors()` and leaves the attribute unset instead of aborting the load or storing a wrong value. JSON writes values it cannot represent exactly (a `bigint`, `NaN`, `Infinity`, a `Date`, bytes) as strings.
  - `EClassifier.getDefaultValue()` returns `0n` for `ELong` and an enum's first literal for an enum. Generated defaults are checked: an invalid `defaultValueLiteral` of a primitive attribute is a generation error.
  - The instance editor edits `bigint` attributes in a text field.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Generated packages no longer rebuild annotations that only steer code generation: EMF's GenModel annotations and the generator's own `https://typemf.dev/generator…` annotations (documentation, operation and feature bodies, imports) are left out of the runtime metamodel. Only a data type keeps its generator annotations, since generating another package that uses the data type reads its TypeScript type and import from them. This makes the runtime Ecore metamodel about 20% smaller.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Hide internals from the published API. Core's type declarations no longer contain members that only core itself uses: `associateRoot`/`dissociateRoot`, `Resource.eSetResourceSet()`, `BasicEList.basicAdd()`/`basicRemove()`, and `EObjectImpl.eInverseAdd()`/`eInverseRemove()`/`eBasicSetContainer()`/`eSetDirectResource()`/`eSetProxy()`/`eBasicDetachFromContainer()`, as well as the bootstrap-only `eBootstrapList()` of the metamodel classes. Generated classes no longer get an `eBootstrapList()` method, except when generating Ecore itself. Members that generated code calls (`eDidAdd`, `eDidRemove`, `eNotify`, `eBasicSetValue`, `getModelGeneration`, the ID setters) stay public and are documented as such. To add a resource to a resource set, use `ResourceSet.createResource()`.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Computed many-valued features, such as `EClass.getEAllStructuralFeatures()` and `getEAllAttributes()`, now return a read-only `UnmodifiableEList` that throws when changed. Before, changing the returned list silently altered what later calls returned until the model changed again. This also applies to many-valued features with a custom getter in generated packages.

### Patch Changes

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Document the generated Ecore API: every metamodel class, feature and operation (`EClass.getEAllStructuralFeatures()`, `getFeatureID()`, `isSuperTypeOf()`, `ETypedElement.getUpperBound()` and so on) now has a doc comment, taken from `documentation` details in `Ecore.ecore`. Generated doc comments are wrapped at 100 columns.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - A user model with a class named `EClassifier`, `EStructuralFeature` or `EOperation` no longer gets Ecore's internal ID bookkeeping (`classifierId`, `featureId`, `containerClass`, `operationId`) generated into it, and its own operations of those names are generated normally. That bookkeeping is now only generated with the `generate-ecore` option. Template sets' `validate()` now also receives the generation options.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix `getDefaultValue()` always returning `undefined`. `EClassifier.getDefaultValue()` is now `false` for `EBoolean` and `0` for the numeric primitive data types, matching what generated classes return for an unset attribute. `EStructuralFeature.getDefaultValue()` converts the feature's `defaultValueLiteral` with the factory of its type, and otherwise falls back to the type's default value. Generated packages now also set each feature's `defaultValueLiteral` in the runtime metamodel.

- [#10](https://github.com/typemf/typemf/pull/10) [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223) Thanks [@bergerbd](https://github.com/bergerbd)! - Shorten the internal comments of core and of generated packages to what the code does, removing notes about how it came about.
- Updated dependencies [[`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223), [`131268d`](https://github.com/typemf/typemf/commit/131268d5bfe02c0870b61feb91a1323116601223)]:
  - @typemf/core@0.8.0
  - @typemf/xmi@0.8.0
  - @typemf/node@0.8.0

## 0.7.0

### Patch Changes

- [#8](https://github.com/typemf/typemf/pull/8) [`b75a60a`](https://github.com/typemf/typemf/commit/b75a60aee5cbf52fdba713d451b56c753f89e177) Thanks [@bergerbd](https://github.com/bergerbd)! - Fix every generated package (including `@typemf/core`'s own self-hosted Ecore metamodel) requiring `{Pkg}PackageImpl.eINSTANCE`/`.init()` to be touched before anything else could be used - `new EClassImpl().setName('Book')`, or any other direct construction of a generated class, previously threw `getEcorePackageRef() called before the EcorePackage singleton finished constructing itself.`

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
