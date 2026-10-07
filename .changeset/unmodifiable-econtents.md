---
'@typemf/core': minor
---

`EObject.eContents()` now returns a read-only snapshot that throws when changed, instead of a detached copy on which `add()` and `remove()` silently did nothing.
