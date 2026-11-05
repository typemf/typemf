---
'@typemf/xmi': minor
'@typemf/json': minor
'instance-editor': minor
---

Empty model files can be opened and edited, as VS Code's **New File** creates them. `@typemf/xmi` and `@typemf/json` load an empty or whitespace-only file as a document without roots instead of failing. The Instance Editor creates the root element when it opens such a file: an `EPackage` named after the file for `.ecore`, and an instance of a class you pick for `.xmi` and `.json`. The new root is an ordinary edit: the file is marked dirty, Undo removes the root again, and nothing is written until you save. A document without a root shows a **Create Root Element…** button.
