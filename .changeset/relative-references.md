---
'@typemf/core': minor
'@typemf/xmi': patch
---

Support relative references between documents - the form EMF writes by default for a cross-document reference between files in the same workspace (e.g. `href="other.xmi#Dune"`), instead of requiring (and always writing) an absolute URI.

- `URI.parse()` no longer throws on a string with no scheme; it returns a relative `URI` (`isRelative()` true, `getScheme()` undefined). New `resolve(base)` makes it absolute against a base document's URI; new `deresolve(base)` computes the shortest relative form, the inverse of `resolve()`.
- `@typemf/xmi` now resolves a relative `href` - both the `<feature href="..."/>` child-element form and the same-attribute form - against the document's own URI when reading, and writes a relative `href` (deresolved against the document's own URI) when saving a cross-document reference, instead of always reading/writing an absolute one.

Loading a document with a relative, EMF-style `href` previously threw `Not a valid absolute URI`.
