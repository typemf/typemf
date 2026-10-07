---
'@typemf/generator': minor
'@typemf/core': patch
---

Generated packages no longer rebuild annotations that only steer code generation: EMF's GenModel annotations and the generator's own `https://typemf.dev/generator…` annotations (documentation, operation and feature bodies, imports) are left out of the runtime metamodel. Only a data type keeps its generator annotations, since generating another package that uses the data type reads its TypeScript type and import from them. This makes the runtime Ecore metamodel about 20% smaller.
