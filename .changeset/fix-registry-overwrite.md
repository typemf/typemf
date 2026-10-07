---
'instance-editor': patch
---

Fix a new model instance silently replacing an already-registered package: `openNewInstance` registered its (possibly dynamically loaded) package in the shared runtime registry unconditionally, overwriting whatever another extension, or an earlier new instance of the same dynamic metamodel, had registered under the same nsURI. It now registers only when nothing is registered under that nsURI yet.
