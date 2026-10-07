---
'@typemf/generator': patch
---

A user model with a class named `EClassifier`, `EStructuralFeature` or `EOperation` no longer gets Ecore's internal ID bookkeeping (`classifierId`, `featureId`, `containerClass`, `operationId`) generated into it, and its own operations of those names are generated normally. That bookkeeping is now only generated with the `generate-ecore` option. Template sets' `validate()` now also receives the generation options.
