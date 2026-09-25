# @typemf/json

The first `EObjectSerializer` implementation (`resource/serializer.ts` in
`@typemf/core`) - a JSON persistence format for TMF instance documents,
successor to the original TMF's `TJson`.

## Wire format

```json
{
  "$namespaces": { "lib": "https://typemf.dev/samples/library" },
  "$roots": [
    {
      "$eClass": { "namespace": "lib", "name": "Library" },
      "books": [
        { "$eClass": { "namespace": "lib", "name": "Book" }, "title": "Dune" }
      ],
      "featuredBook": { "$ref": "#Book_Dune" }
    }
  ]
}
```

- **`$namespaces`**: a document-scoped prefix table (like XML namespace
  prefixes) so full nsURIs aren't repeated on every object.
- **`$eClass`**: `{ namespace, name }` rather than a bare class name, so
  classifiers resolve unambiguously even across multiple packages.
- Containment features nest inline; non-containment (cross-reference)
  features become `{ "$ref": "...", "$eClass"?: {...} }`.
- **`$ref` addressing** (mirrors EMF's XMI `href`, one attribute for both
  cases, distinguished by whether a document part precedes `#`):
  - `"#fullId"` - same-resource, by ID attribute (e.g. `"#Book_Dune"`)
  - `"#/0/books/2"` - same-resource, positional (used when the target has
    no ID attribute)
  - `"<uri>#<either form>"` - cross-resource; becomes a `ProxyEObjectImpl`,
    resolved lazily via `ResourceSet.resolve()`
- **`$eClass` on a `$ref`** is only present when the target's actual type
  differs from the feature's statically declared type (mirrors XMI's
  `xsi:type`, which is likewise only emitted when needed) - this is what
  lets an unresolved proxy already report the correct (possibly more
  derived) type before it's ever loaded.
- **`EEnum` attributes** serialize as their literal's name (`"ACTIVE"`),
  not its ordinal value - see the note in `json-serializer.ts` on what this
  implies about the in-memory representation.
- **`EDate` attributes** serialize as ISO 8601 strings.

The actual fragment-addressing logic (`computeFragment`/`resolveFragment`,
covering both the ID and positional forms) lives in `@typemf/core`, not
here - it's format-agnostic, `ResourceSet.resolve()` needs the exact same
logic for the cross-resource case, and `@typemf/xmi` will need it again.

## Usage

```ts
import { ResourceSetImpl, URI } from '@typemf/core';
import { registerJsonFormat } from '@typemf/json';

const resourceSet = new ResourceSetImpl();
resourceSet.setUriConverter(myUriConverter); // e.g. from @typemf/node
registerJsonFormat(resourceSet.getResourceFactoryRegistry());

const resource = await resourceSet.getResource(URI.parse('file:///model.json'), true);
```

See `src/__tests__/json-serializer.test.ts` for a complete example
including containment, both reference-addressing forms, polymorphism, and
cross-resource lazy resolution.
