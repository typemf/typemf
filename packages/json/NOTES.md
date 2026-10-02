# Deferred / tracked design decisions

## Same-resource non-containment references are resolved after full document construction

Deserialization is two-phase by design: every object in the document is constructed first
(attributes + containment only), then every non-containment reference is wired in a second
pass. This is what makes same-resource forward references (an object referencing another one
that appears _later_ in the JSON) work correctly regardless of key/array order - the target is
guaranteed to already exist by the time phase 2 runs. If a future change makes deserialization
streaming/incremental, this two-phase structure needs to be preserved deliberately, not
optimized away.

## `EEnum` attribute values: literal name as the in-memory representation

This package establishes (there was no prior convention anywhere in `@typemf/core` - no
`EEnum`-typed attribute exists in any of its test fixtures yet) that an `EEnum` attribute's
in-memory value IS its literal's name, as a plain string - the same way an `EString`
attribute's value is a plain string. `encodeAttributeValue`/`decodeAttributeValue` in
`json-serializer.ts` are therefore a no-op passthrough for `EEnum` values, not a real
conversion - the wire and in-memory representations are literally the same value.

**Tracked for:** carrying this convention back into `@typemf/core`'s own documentation once an
`EEnum`-typed feature actually exists there (or in a generated model), so `@typemf/xmi` and any
future generator output agree with it rather than each independently guessing.

## No coverage yet for `EMap`-typed features, `EOperation` signatures, or many-valued attributes

`EMap` is still tracked as deferred in `@typemf/core`'s own `NOTES.md` - nothing here handles
it either, consistently. `EOperation`s are signature-only everywhere in TMF (no `eInvoke`), so
there's nothing for a serializer to do with them; not a gap, just noted for completeness.
Many-valued _attributes_ (as opposed to many-valued references, which are tested) aren't
exercised by any current test - the code path exists (`feature.isMany()` is checked uniformly
for both attributes and references) but hasn't been proven against a concrete example.

## Cross-format references (a target living in an @typemf/xmi document)

`serializeReferenceValue()`'s cross-document branch defers to the target resource's own
`getSerializer().computeFragment()` when one is provided, falling back to
`@typemf/core`'s default otherwise - added specifically so a reference into an
`@typemf/xmi`-owned document writes EMF's fragment grammar rather than this package's
own. See `@typemf/core`'s `NOTES.md` ("EObjectSerializer.computeFragment/resolveFragment
are optional per-format overrides") for the full design, and `@typemf/xmi`'s
`cross-format.test.ts` for both directions proven against actual bytes.
