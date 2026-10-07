---
'@typemf/core': minor
'@typemf/generator': minor
---

Computed many-valued features, such as `EClass.getEAllStructuralFeatures()` and `getEAllAttributes()`, now return a read-only `UnmodifiableEList` that throws when changed. Before, changing the returned list silently altered what later calls returned until the model changed again. This also applies to many-valued features with a custom getter in generated packages.
