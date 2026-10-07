---
'@typemf/json': patch
---

Relative `$ref`s to other documents are now resolved against the URI of the document that contains them, so `"api.ecore#//…"` refers to the file next to it. References to other documents are written relative to the saving document when both share scheme and authority, so a folder of models can be moved or checked in.
