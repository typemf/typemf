---
'@typemf/core': patch
---

Fix a dynamic instance losing data when its `EClass` has two supertypes that each declare a feature with the same raw `featureID` (e.g. `Movable.position` and `Named.label`, each `id=1` within their own declaring class) - `eSet` on one silently overwrote the other's stored value.

`EClass.getFeatureID(feature)` now returns the feature's position in `getEAllStructuralFeatures()` (unique across the whole class, including the multiple-inheritance case) instead of the feature's own, per-declaring-class id; `getEStructuralFeature(number)` is its exact inverse. `DynamicEObjectImpl` keys its storage by this id.

Generated (non-dynamic) classes are unaffected - the TypeScript generator only ever produces single-inheritance classes, so this collision could only happen for a dynamic `EClass` with genuine multiple `eSuperTypes`.
