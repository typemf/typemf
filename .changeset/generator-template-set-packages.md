---
'@typemf/generator': minor
---

Template sets can come from npm packages. A package declares them under `typemf.templateSets` in its `package.json`; the CLI finds the ones the project depends on, and `--template-set <package folder>` adds others (`--no-discover` turns discovery off). `registerTemplateSet` and `registerTemplateSets` do the same for programs.

A template set can describe its options with a JSON Schema, which is checked before generating; the `typescript` set now rejects options it doesn't know. `generatorConfigSchema` builds the JSON Schema of a config file.

Config files are now named `*.typemf-generator.json`, and the CLI reads `./typemf-generator.json` by default (was `./typemf-generator.config.json`).
