# Deferred / tracked design decisions

Calibrated honestly: some of what's below is verified against documented real EMF
behaviour (cross-checked against actual Java EMF output, not just assumed); some is a
judgment call made where the evidence was ambiguous or unavailable. Both are flagged
explicitly rather than presented as equally certain.

## Verified against real EMF behaviour

- Attribute vs. nested element for a reference is decided by document locality (same vs.
  different resource), not by cardinality or containment.
- The default fragment grammar (`//@feature.index`, `/` for the root itself, no `xmi:id`
  unless UUID mode is explicitly requested) - see `emf-fragment.ts`.
- `xsi:type` on a cross-document `href` child element only when the actual type differs
  from the feature's declared type.
- Metamodel elements (`ENamedElement`s) address by name (`#//Book`) rather than
  position - not yet implemented (see "Deferred" below), but the _reason_ it's a
  separate case (an `eURIFragmentSegment()` override point specific to named elements)
  is documented so it isn't mistaken for a `.ecore`-specific special case later.

## Best-effort reconstruction, not independently verified

- **Polymorphism on a same-document (attribute-form) reference.** Reconstructed from
  indirect evidence (a bug-fix discussion comparing against real Java EMF output) that
  such a reference writes as pairwise "prefix:Type fragment" tokens when a value's
  actual type differs from the feature's declared type. Our writer/reader round-trip
  correctly through themselves; not confirmed against an actual Eclipse-produced file
  with a _mixed_ list (some values polymorphic, some not) - current behaviour uniformly
  pairs every value in the list once any one of them needs it. **Recommend validating
  against a real Eclipse-exported file before relying on this specific case for
  interop with external tooling.**
- **Many-valued `EAttribute` serialization** (repeated child elements). A reasonable,
  unambiguous choice, but not confirmed as EMF's own literal default for this case
  (EMF may use a single space/newline-separated attribute instead in some
  configurations).

## Deferred - v1 scope

- **Multi-root documents** (the `<xmi:XMI>` wrapper form). `XmiSerializer.serialize()`
  throws a clear error for more than one root rather than guessing at the wrapper
  shape. Single-root is overwhelmingly the common case for hand-authored and
  tool-generated instance documents.
- **Name-based fragments for `ENamedElement`s** (`#//Book`, `#//Book/title`). Blocked on
  Ecore self-hosting regardless (see `@typemf/core`'s own `NOTES.md`), so deferring
  this costs nothing right now - there's no self-describing metamodel to exercise it
  against yet.
- **`.ecore` file support.** `registerXmiFormat()` registers only for the `"xmi"`
  extension. Once the generator can bootstrap a self-hosted `EcorePackage`, register
  the same `XmiResourceFactory` for `"ecore"` too and retire `@typemf/core`'s
  hand-rolled `ecore/` parser/writer - see the tracked item there.

## Design note: independent from @typemf/json by deliberate choice

`emf-fragment.ts` and `namespace-collector.ts` are NOT shared with @typemf/json's
equivalent logic (`json-pointer` concepts, `NamespaceTable`) - a deliberate decision,
not an oversight, since the two packages' grammars are genuinely different (EMF's
`//@feature.index` vs. this project's own `/0/feature/2`) and forcing them through one
shared implementation was explicitly decided against. What IS shared is the _seam_
each format plugs into: `EObjectSerializer.computeFragment`/`resolveFragment` (optional,
in `@typemf/core`) is what lets a JSON document correctly reference an object living in
an XMI document and vice versa - see `cross-format.test.ts`, which proves both
directions against the actual bytes written, not just successful resolution. This seam
is genuinely one shared piece of design between the two packages; the grammars
themselves are not.
