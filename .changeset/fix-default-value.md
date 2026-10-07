---
'@typemf/core': patch
'@typemf/generator': patch
---

Fix `getDefaultValue()` always returning `undefined`. `EClassifier.getDefaultValue()` is now `false` for `EBoolean` and `0` for the numeric primitive data types, matching what generated classes return for an unset attribute. `EStructuralFeature.getDefaultValue()` converts the feature's `defaultValueLiteral` with the factory of its type, and otherwise falls back to the type's default value. Generated packages now also set each feature's `defaultValueLiteral` in the runtime metamodel.
