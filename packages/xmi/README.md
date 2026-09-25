# @typemf/xmi

An `EObjectSerializer` (see `@typemf/core`'s `resource/serializer.ts`) targeting real
EMF's actual XMI conventions, so files this package produces open in Eclipse-based
tooling and vice versa. See `NOTES.md` for exactly which conventions are verified
against documented real EMF behaviour versus a best-effort reconstruction - worth
reading before relying on this for interop with external tools, especially for the one
flagged, not-fully-verified case (polymorphism on a same-document reference).

## Wire format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<lib:Library xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:lib="https://typemf.dev/samples/library">
  <books title="Dune" published="1965-08-01T00:00:00.000Z"/>
  <books xsi:type="lib:AudioBook" title="Foundation" narrator="Scott Brick"/>
</lib:Library>
```

Key rules, all with real-EMF rationale in the code comments and `NOTES.md`:

- A reference (any cardinality) is an **XML attribute** when its target is in the
  **same document**, and a **nested `<feature href="..."/>` child element** when the
  target is in a **different document** - dispatch is by document locality, not by
  containment or cardinality.
- Fragments follow EMF's actual default grammar: `//@books.2` (positional, single
  root), `/` (the root itself), or the bare ID-attribute value when the `EClass` has
  one (`Dune`, not `Book_Dune`) - see `emf-fragment.ts`.
- `xsi:type` appears only when an object's actual class differs from its declared
  type - on the containment element for polymorphic containment, on the `href`
  element for polymorphic cross-document references.
- No `xmi:id` by default - matches EMF's own default (fragment-path, non-UUID)
  behaviour rather than always generating one.

## Cross-format references

`@typemf/xmi` and `@typemf/json` can reference each other's documents correctly: the
fragment written for a cross-document reference always uses the *target* document's own
format's grammar, not the referencing document's. See `src/__tests__/cross-format.test.ts`
for both directions, verified against the actual bytes written.

## Usage

```ts
import { ResourceSetImpl, URI } from '@typemf/core';
import { registerXmiFormat } from '@typemf/xmi';

const resourceSet = new ResourceSetImpl();
resourceSet.getUriConverterRegistry().register(myUriConverter); // e.g. from @typemf/node
registerXmiFormat(resourceSet.getResourceFactoryRegistry());

const resource = await resourceSet.getResource(URI.parse('file:///model.xmi'), true);
```

## v1 scope

Single-root documents only; a multi-root document throws a clear error rather than
guessing at the `<xmi:XMI>` wrapper form. `.ecore` file support isn't registered yet -
that's the same machinery pointed at a bootstrapped, self-hosted `EcorePackage`, which
doesn't exist until `@typemf/generator` can produce it. See `NOTES.md` for the full list.
