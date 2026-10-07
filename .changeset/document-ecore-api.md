---
'@typemf/core': patch
'@typemf/generator': patch
---

Document the generated Ecore API: every metamodel class, feature and operation (`EClass.getEAllStructuralFeatures()`, `getFeatureID()`, `isSuperTypeOf()`, `ETypedElement.getUpperBound()` and so on) now has a doc comment, taken from `documentation` details in `Ecore.ecore`. Generated doc comments are wrapped at 100 columns.
