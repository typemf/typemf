# @typemf/vscode-runtime

API and build tooling for VS Code extensions that use the
[TypeMF Runtime](https://marketplace.visualstudio.com/items?itemName=typemf.vscode-runtime)
extension.

Every extension that bundled its own copy of `@typemf/core` would get its own `EObjectImpl`, its
own `EcorePackage` and its own registry; `instanceof` checks and type guards then fail between
extensions. The runtime extension therefore holds exactly one instance of each shared module, and
extensions get these modules from it instead of bundling them.

## Installation

```bash
npm install --save-dev @typemf/vscode-runtime @typemf/core esbuild
```

In your extension's `package.json`:

```json
"extensionDependencies": ["typemf.vscode-runtime"]
```

## Using the runtime

```ts
import { getTypeMfRuntime } from '@typemf/vscode-runtime';
import { URI } from '@typemf/core';

export async function activate(): Promise<void> {
  const runtime = await getTypeMfRuntime();
  const resourceSet = runtime.createResourceSet();
  const resource = await resourceSet.getResource(URI.createFileURI('/path/to/model.xmi'), true);
}
```

`TypeMfRuntimeApi` gives access to the shared `packageRegistry`, `resourceFactoryRegistry` and
`uriConverterRegistry`. Resource sets from `createResourceSet()` use these registries.

## Bundling

Build your extension as CommonJS with the `typemfShared` esbuild plugin. It replaces every import
of a shared module with a lookup in the runtime and checks the version range from your
`package.json` when your extension activates.

```js
import { typemfShared } from '@typemf/vscode-runtime/esbuild';
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.cjs',
  platform: 'node',
  format: 'cjs',
  external: ['vscode'],
  plugins: [typemfShared()],
});
```

`@typemf/core`, `@typemf/xmi`, `@typemf/json` and `@typemf/node` are shared by default. Add shared
modules from other extensions with `typemfShared({ modules: ['library-model'] })`. Each shared
module you import must be listed in your `package.json` dependencies.

## Providing a model package

An extension makes a generated model package available to others by declaring it under
`typemf.modules` in its `package.json`:

```json
"extensionDependencies": ["typemf.vscode-runtime"],
"typemf": {
  "modules": {
    "library-model": {
      "path": "./dist/library-model.cjs",
      "version": "1.0.0",
      "packages": {
        "https://example.org/library": "LibraryPackageImpl"
      }
    }
  }
}
```

- `path`: the module's CommonJS bundle, built with `typemfShared()`.
- `version`: a semver version, checked against the consumers' ranges.
- `packages`: maps each nsURI to the export that holds the `EPackage`, or a class with a static
  `eINSTANCE`. The runtime registers these nsURIs and loads the module on first use.

A module name may be provided by only one extension. Consumers list the providing extension in
their `extensionDependencies` and import the module as usual.

See [`examples/library-model`](https://github.com/typemf/typemf/tree/main/examples/library-model)
and [`examples/library-extension`](https://github.com/typemf/typemf/tree/main/examples/library-extension)
for a provider and a consumer that subclasses a provided class.

## Entry points

| Import                           | Contents                                                       |
| -------------------------------- | -------------------------------------------------------------- |
| `@typemf/vscode-runtime`         | `getTypeMfRuntime`, `TypeMfRuntimeApi`, `RUNTIME_EXTENSION_ID` |
| `@typemf/vscode-runtime/esbuild` | `typemfShared` esbuild plugin                                  |
| `@typemf/vscode-runtime/host`    | Internals of the runtime extension itself                      |

## License

Apache-2.0
