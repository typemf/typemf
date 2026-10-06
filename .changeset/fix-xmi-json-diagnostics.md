---
'@typemf/xmi': patch
'@typemf/json': patch
---

Fix loading not reporting problems the EMF way (XMI-04, JSON-04): both formats now record a diagnostic on `Resource.getErrors()`/`getWarnings()` and keep loading the rest of the document, instead of silently dropping data or throwing and aborting the whole load.

- An unknown attribute/element (XMI) or key (JSON) is a warning - the value is dropped (as before; it would be lost on the next save regardless), but it's now visible instead of silent.
- An unresolved same-document/same-resource reference is an error - the feature is left unset instead of the load throwing.
- `@typemf/json` additionally reports invalid JSON, or a document missing a `$roots` array, as an error with zero roots instead of throwing a raw `SyntaxError`/`TypeError`.
