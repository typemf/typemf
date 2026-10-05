---
'@typemf/generator': patch
---

Fix generated TypeScript failing strict `tsc`/ESLint configs (`noImplicitOverride`, `@typescript-eslint/strictTypeChecked`/`stylisticTypeChecked`):

- `*FactoryImpl.create()` now declares `override`, matching its base `EFactoryImpl.create()`.
- Numeric ids (`getFeatureID()`, `getClassifierID()`) interpolated into thrown error messages are now wrapped in `String(...)`, satisfying `@typescript-eslint/restrict-template-expressions`.
- Lazy list-cache initialization (`eBootstrapList`, many-valued feature getters) now uses `??=` instead of `if (!x) { x = ... }`, satisfying `@typescript-eslint/prefer-nullish-coalescing`.
- `eBasicSetValue`'s `value` parameter, and the `Switch` class's stub `case*`/`defaultCase` parameters, are now named `_value`/`_object` instead of being marked with a `void` statement when genuinely unused - avoiding `@typescript-eslint/no-meaningless-void-operator` without disabling `noUnusedParameters`.
- `*PackageImpl.ts` no longer unconditionally imports `EAttributeImpl`, `EReferenceImpl`, `EOperationImpl`, `EParameterImpl`, `EDataTypeImpl`, `EEnumImpl`, `EEnumLiteralImpl`, and `EAnnotationImpl` - each is only imported when the package actually contains that classifier/feature/annotation kind. `EFactoryImpl` is no longer imported at all, since it was never referenced in this file's body.

Projects generating from a package with no enums, operations, annotations, or a class with zero features previously saw 1-3 `tsc` errors and dozens of ESLint errors in the generated output; all of the above are now clean by construction under a typical strict config.
