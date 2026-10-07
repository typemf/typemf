---
'@typemf/core': patch
'@typemf/xmi': patch
---

Name paths follow EMF's convention for repeated names: `//Problem/solve.1` is the second element named `solve`, such as an overloaded operation, and is written that way instead of by position. References to operations, parameters and enum literals of a `.ecore` file, also from JSON documents, are written as name paths and keep resolving after the elements are reordered.
