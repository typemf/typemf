# TypeMF

TypeMF brings the [Eclipse Modeling Framework](https://eclipse.dev/emf/) (EMF) to TypeScript and
VS Code. It aims at full EMF compatibility: the Ecore metamodel, reflective and generated model
code, and XMI files that can be exchanged with Eclipse.

TypeMF is for TypeScript developers who want model-driven development, and for the modeling
community that wants to use its Ecore models outside Eclipse. It builds on the ideas of
[TMF](https://github.com/tripsnek/tmf), a lightweight EMF port.

> **Status:** 0.5.0 is the first public release and a preview. APIs and file formats may still
> change before 1.0. Known gaps: `EMap` is not supported, and XMI documents must have exactly one
> root object.

## Packages

The libraries don't depend on VS Code. `@typemf/core`, `@typemf/xmi` and `@typemf/json` also run in
the browser.

| npm package                                         | Description                                                   |
| --------------------------------------------------- | ------------------------------------------------------------- |
| [`@typemf/core`](packages/core)                     | Ecore metamodel, `EObject`, dynamic objects, resources        |
| [`@typemf/xmi`](packages/xmi)                       | XMI and `.ecore` serialization, compatible with EMF           |
| [`@typemf/json`](packages/json)                     | JSON serialization                                            |
| [`@typemf/node`](packages/node)                     | File access in Node.js (`file:` URIs)                         |
| [`@typemf/generator`](packages/generator)           | Generates TypeScript model code from `.ecore` files           |
| [`@typemf/vscode-runtime`](packages/vscode-runtime) | API and esbuild plugin for VS Code extensions that use TypeMF |

| VS Code extension                                   | Description                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| [TypeMF Instance Editor](packages/instance-editor)  | Tree editor for `.xmi`, `.json` and `.ecore` files               |
| [TypeMF Runtime](packages/vscode-runtime-extension) | Shared registry and modules for all TypeMF extensions in VS Code |

## Getting started

- **Use models in TypeScript:** start with [`@typemf/core`](packages/core) and a format package
  ([`@typemf/xmi`](packages/xmi) or [`@typemf/json`](packages/json)).
- **Generate model code:** see [`@typemf/generator`](packages/generator).
- **Edit models in VS Code:** install the TypeMF Instance Editor.
- **Write a VS Code extension with your own model:** see
  [`@typemf/vscode-runtime`](packages/vscode-runtime) and the examples in [`examples/`](examples).

## Development

Requirements: Node.js 22 or later and pnpm (the version is pinned in `package.json`; with
[Corepack](https://nodejs.org/api/corepack.html) it is picked up automatically).

```bash
pnpm install
pnpm build        # build all packages
pnpm test         # run all tests
pnpm typecheck
pnpm lint
pnpm format       # format with Prettier
```

The Ecore metamodel in `packages/core/src/metamodel` is generated from
[`ecore-workspace/Ecore.ecore`](ecore-workspace/Ecore.ecore). Don't edit it by hand; change the
model or the generator templates and run:

```bash
ecore-workspace/run-generator.sh
```

### Repository layout

```
packages/          npm packages and VS Code extensions
examples/          example extensions: a model provider and a consumer (not published)
ecore-workspace/   Ecore.ecore, the source of the generated core metamodel
```

## License

[Apache-2.0](LICENSE)
