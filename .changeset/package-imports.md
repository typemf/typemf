---
'@typemf/generator': minor
---

A `.ecore` file can now use classifiers of another `.ecore` file. The generator loads the referenced file, and the new `package-imports` option says, by nsURI, where that package's generated code is: a folder relative to `outputDir`, or a module name. This also applies to data types of another package, which the generated package class previously looked up on Ecore's package. Supertypes from another package are reported as unsupported.

References to Ecore's classes, such as `EModelElement`, are now imported from `@typemf/core` instead of from a file in the generated package that doesn't exist.
