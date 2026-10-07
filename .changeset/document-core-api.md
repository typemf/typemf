---
'@typemf/core': patch
---

Document what the public API does: `EObject`, `EList`, `Notification`, `Resource`, `ResourceSet`, `EObjectSerializer`, the registries and the helper functions now describe their behavior, including details such as `Resource.load()` replacing already loaded contents, `ResourceSet.resolve()` throwing when a proxy cannot be resolved, and `eContents()` returning a copy. The `createInstanceOf` error message no longer refers to a nonexistent `EcoreParser`.
