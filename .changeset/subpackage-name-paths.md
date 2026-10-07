---
'@typemf/core': patch
'@typemf/xmi': patch
---

EMF name paths now reach into subpackages at any depth, as in `#//api/Solution` or `other.ecore#//api/inner/Detail`, and can address any named element, such as an enum literal (`//Kind/OPEN`). Name and position segments can be mixed. When saving, a named Ecore element is written by name, as EMF does; it falls back to its position when a sibling has the same name.

Same-document references are now written as EMF writes them: `eType="#//api/Solution"`, with a leading `#` and without a type, instead of `eType="ecore:EClass //api/Solution"`. Files in the old form still load.
