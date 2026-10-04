# @typemf/generator

Generates TypeScript model code for [`@typemf/core`](https://www.npmjs.com/package/@typemf/core)
from a `.ecore` file. Templates are written in [Nunjucks](https://mozilla.github.io/nunjucks/).

## Installation

```bash
npm install --save-dev @typemf/generator
```

## Command line

```bash
npx typemf-generate [config file]
```

The config file defaults to `./typemf-generator.config.json`:

```json
{
  "ecoreFile": "./model/library.ecore",
  "outputDir": "./src/generated",
  "templateSet": "typescript",
  "options": {}
}
```

Paths are resolved relative to the config file. `typescript` is currently the only template set.

## Generated code

For a package `library` with the classes `Library`, `Writer` and `Book`:

```
LibraryPackage.ts        package interface
LibraryFactory.ts        factory interface
types/Book.ts            one interface per class
impl/BookImpl.ts         one implementation per class
impl/LibraryPackageImpl.ts
impl/LibraryFactoryImpl.ts
util/LibrarySwitch.ts    visitor with supertype fallback
util/LibraryTypeGuards.ts
```

All files are regenerated on every run; don't edit them. To customize a class, subclass its
`Impl` class and pass a factory that creates your subclass to `LibraryPackageImpl.init(factory)`,
before anything accesses `LibraryPackageImpl.eINSTANCE`.

## Annotations

The generator reads these `EAnnotation` details from the `.ecore` file:

| Source                                 | Key                             | On                 | Meaning                                           |
| -------------------------------------- | ------------------------------- | ------------------ | ------------------------------------------------- |
| `https://typemf.dev/generator`         | `documentation`                 | any element        | TSDoc comment                                     |
| `https://typemf.dev/generator`         | `body`                          | operation          | TypeScript method body                            |
| `https://typemf.dev/generator`         | `type`                          | data type          | TypeScript type the data type maps to             |
| `https://typemf.dev/generator/feature` | `get`, `set`                    | structural feature | custom getter/setter body                         |
| `https://typemf.dev/generator/import`  | `type`, `from`, `internal-from` | data type          | symbol to import and the module to import it from |

Fallbacks: `documentation` is also read from the source `http://www.eclipse.org/emf/2002/Ecore`,
`body` from `http://www.eclipse.org/emf/2002/GenModel`. An operation without a body throws when
called. A data type without a `type` uses its `instanceClassName`, otherwise its name.

## API

```ts
import { generate, loadEcorePackage, typescriptTemplateSet } from '@typemf/generator';

const pkg = await loadEcorePackage('/path/to/library.ecore');
const files = generate(pkg, typescriptTemplateSet); // [{ path, content }], paths relative
```

`generate` doesn't write files; `runGeneration` does, as the CLI does.

## License

Apache-2.0
