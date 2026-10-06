---
'instance-editor': minor
---

"Link external..." can now pick a candidate from any registered package (Ecore itself, or anything the `typemf.ecoreMappings` setting dynamically registers at activation), not just a file browsed from disk. When at least one package is registered, a picker lets you choose between them and "Browse for a file...", which falls back to the previous file-dialog behavior.
