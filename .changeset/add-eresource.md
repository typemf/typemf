---
'@typemf/core': minor
'@typemf/xmi': patch
'@typemf/json': patch
---

Add `EObject.eResource()` (CORE-08) - the Resource an object is part of, if any: its own if it's a root, otherwise its nearest containing root's. Matches real EMF's own public API, which this project previously worked around with a free function (`getResourceOf`, still exported, now a thin wrapper) kept outside the metamodel specifically to avoid this.

`@typemf/xmi` and `@typemf/json` now call `target.eResource()` directly instead of importing `getResourceOf`.
