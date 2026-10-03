# TypeMF Runtime

The shared runtime for TypeMF extensions in VS Code. It holds one package registry and one
instance of every shared module, so that all TypeMF extensions in a window work on the same
metamodels and the same classes.

You normally don't install this extension yourself: extensions that need it, such as the
[TypeMF Instance Editor](https://marketplace.visualstudio.com/items?itemName=typemf.instance-editor),
list it as a dependency and VS Code installs it with them.

This extension is a preview. Its API may still change before 1.0.

## What it provides

- The TypeMF libraries `@typemf/core`, `@typemf/xmi`, `@typemf/json` and `@typemf/node` as shared
  modules.
- A shared `EPackage` registry, resource factory registry (XMI, Ecore, JSON) and URI converter
  registry (`file:` URIs).
- Model packages provided by other extensions, loaded on first use.
- Metamodels from `.ecore` files listed in the `typemf.ecoreMappings` setting.

## Settings

`typemf.ecoreMappings` registers `.ecore` files as metamodels at startup. Paths are resolved
relative to the first workspace folder. Entries from user, workspace and folder settings are
merged; for the same nsURI the most specific one wins.

```json
"typemf.ecoreMappings": [
  { "nsURI": "https://example.org/library", "ecoreFile": "model/library.ecore" }
]
```

## For extension authors

Use the npm package [`@typemf/vscode-runtime`](https://www.npmjs.com/package/@typemf/vscode-runtime)
to access the runtime from your extension or to provide your own model package.

## License

[Apache-2.0](LICENSE). Source: [github.com/typemf/typemf](https://github.com/typemf/typemf).
