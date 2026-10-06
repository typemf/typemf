---
'@typemf/core': patch
---

Fix `eGet`/`eSet`/`eIsSet`/`eUnset` (every generated class, and `DynamicEObjectImpl`) accepting a feature that doesn't belong to the object's class and silently dispatching on its numeric id instead. Two unrelated classes can each declare a feature with the same id (e.g. both the first attribute of their own class); passing one class's feature to an instance of the other previously read or overwrote whichever of its own features happened to share that id.

`eGet`/`eSet`/`eIsSet`/`eUnset` now throw `The feature '<name>' is not a valid feature` (matching EMF) when the feature isn't in `eClass().getEAllStructuralFeatures()`, instead of accepting it.
