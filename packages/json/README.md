# @typemf/json

JSON serialization for [`@typemf/core`](https://www.npmjs.com/package/@typemf/core).

## Installation

```bash
npm install @typemf/core @typemf/json
```

## Usage

`registerJsonFormat` registers the format for the `json` file extension:

```ts
import { ResourceSetImpl, URI } from '@typemf/core';
import { registerJsonFormat } from '@typemf/json';
import { NodeFileUriConverter } from '@typemf/node';

const resourceSet = new ResourceSetImpl();
resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());
registerJsonFormat(resourceSet.getResourceFactoryRegistry());
resourceSet.getPackageRegistry().register(LibraryPackageImpl.eINSTANCE);

const resource = await resourceSet.getResource(URI.createFileURI('/path/to/library.json'), true);
```

The `EPackage` of every namespace used in the file must be in the package registry before loading.

## Format

```json
{
  "$namespaces": { "library": "https://example.org/library" },
  "$roots": [
    {
      "$eClass": { "namespace": "library", "name": "Library" },
      "name": "City Library",
      "writers": [{ "$eClass": { "namespace": "library", "name": "Writer" }, "name": "Frank Herbert" }],
      "books": [
        {
          "$eClass": { "namespace": "library", "name": "Book" },
          "title": "Dune",
          "pages": 412,
          "author": { "$ref": "#Writer_Frank Herbert" }
        }
      ]
    }
  ]
}
```

- `$namespaces` maps prefixes to nsURIs; `$eClass` names a class by prefix and name.
- `$roots` holds the root objects. A document may have several.
- Contained objects are nested. Other references are `{ "$ref": "..." }`:
  - `#<id>`: an object in the same document, by ID
  - `#/0/books/2`: an object in the same document, by position (for classes without an ID
    attribute)
  - `<uri>#<id or position>`: an object in another document, loaded on demand
- A `$ref` carries `$eClass` only when the target's class differs from the declared type of the
  reference.
- `EDate` values are ISO 8601 strings.

References between JSON and XMI documents work in both directions.

## License

Apache-2.0
