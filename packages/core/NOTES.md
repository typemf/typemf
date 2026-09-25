# Deferred / tracked design decisions

This file exists so that deliberate scoping decisions made while building
the first version of `metamodel/api` and `metamodel/impl` don't quietly get
forgotten. Nothing here is a bug - each item was a conscious "not yet,
because X" call. Revisit when the referenced phase of work starts.

## EMap

`EAnnotation.getDetails()` is typed as a plain `Map<string, string>`, not a
general `EMap<K, V>` construct. That's the right call when values are
primitives (which is all `EAnnotation` ever needs), but it is not a general
substitute for EMF's `EMap`: a feature typed `EMap<EString, SomeEClass>`
needs its values to have a real `eContainer`, participate in opposite/
notification bookkeeping, and serialize as owned children - a bare `Map`
can't do any of that.

**Tracked for:** Phase 1 (serialization/XMI interop work), since `EMap` is
part of the standard `Ecore.ecore` metamodel and real-world `.ecore`/XMI
files can declare features typed against it. Build it against a concrete
external file that exercises it, rather than guessing at the shape now.
Expected shape: `EMap<K,V> extends EList<EMapEntry<K,V>>` in the API layer
with `get`/`put`/`containsKey`/`keys`/`values` convenience methods, backed
by `EMapImpl extends BasicEListImpl` in impl.

## Reflection over the metamodel itself

(We have to build the generator first and then we will solve this problem)

`EModelElementImpl` and its subclasses (`EClassImpl`, `EAttributeImpl`,
`EPackageImpl`, ...) do **not** support `eGet`/`eSet`/`eIsSet`/`eUnset` -
those throw. Real EMF supports this because `EClass`/`EAttribute`/etc. are
themselves instances of a bootstrapped, self-describing `Ecore.ecore`
metamodel (an `EClass` called "EClass" whose features are "name",
"eSuperTypes", etc.). We have not built that bootstrap.

This is different from - and does not block - the "dynamic instantiation"
work (`DynamicEObjectImpl`/`DynamicEFactoryImpl`), which is about
reflectively creating instances of _user-defined_ classes like `Book`, not
about reflecting over the metaclasses themselves.

**Tracked for:** no phase yet. Build it if/when something concrete needs to
reflect over the metamodel itself the way an instance editor reflects over
a `Book` - e.g. a generic "metamodel browser" UI, or a validator that wants
to read constraints off `EClass`/`EAttribute` via the same `eGet` path it
uses for everything else. Until then it's speculative scope.

## No global/ambient EPackageRegistry in this package

`EPackageRegistryImpl` is a plain, instantiable class with no
`GLOBAL_REGISTRY`-style singleton exported from `@typemf/core`. This was a
deliberate call, not an oversight: a module-level singleton only stays
"global" within one instantiation of this module, and separate VSCode
extensions that each bundle their own copy of `@typemf/core` get separate
module instances even in the same process - a `core`-level global would
silently fork across them while looking like a shared source of truth.

The one legitimate shared-instance mechanism is `@typemf/vscode-runtime`'s
`TypeMfRuntime.packageRegistry`, handed out explicitly via `activate()` to
every extension that depends on it, so there's exactly one honest way to
share a registry instead of one honest way and one illusory one.

A consuming app outside that context (a Node script, a CLI, a single
webview with no cross-extension concerns) creates its own
`EPackageRegistryImpl` explicitly near its entry point.

## Proxy resolution now supports both ID-based and positional fragments (resolved)

Was previously tracked here as a limitation; resolved by `resource/eobject-address.ts`'s
`computeFragment()`/`resolveFragment()`, added while building `@typemf/json`. An object with
an ID attribute set still addresses by `fullId()` ("Book_Dune"); one without falls back to a
positional, containment-index path ("/0/books/2", JSON-Pointer-shaped) computed relative to the
target resource's own roots. `ResourceSet.resolve()` and every `EObjectSerializer` (currently
just `@typemf/json`) share this one implementation, so a proxy created by any serializer
resolves the same way regardless of which one produced it.

The positional fallback still has the trade-off EMF's own positional "e-path" fragments
(`#//@classifiers.2`) have: it breaks if anything earlier in the same containment chain is
reordered before the reference is resolved. Prefer giving any EClass that's likely to be
cross-referenced a real ID attribute.

## `fullId()`'s fallback (no ID attribute) is not idempotent

Noticed while building the fragment-addressing above, not yet fixed: `EObjectImpl.fullId()`'s
fallback path (`eobject-impl.ts`) increments a per-process counter *on every call*, so calling
`fullId()` twice on the same object with no ID attribute returns two different strings. This
was harmless as long as nothing depended on the fallback value being stable - but it's worth
knowing before writing code that calls `fullId()` more than once on the same unidentified
object expecting the same answer back (`computeFragment()`/`resolveFragment()` in
`eobject-address.ts` deliberately never call `fullId()` on an object without a real ID
attribute, specifically to avoid this).

**Tracked for:** decide when it actually matters for something - either cache a
per-object generated id (a `WeakMap<EObject, string>`, assigned once on first fallback call),
or make the non-stability explicit in `fullId()`'s own doc comment so nobody relies on it
across two calls by accident. Low urgency: nothing in `@typemf/core` or `@typemf/json` today
calls `fullId()` on an ID-less object more than once.

## EObjectSerializer.computeFragment/resolveFragment are optional per-format overrides

Added while building `@typemf/xmi`: two optional methods on `EObjectSerializer`, used by
`ResourceSetImpl.resolve()` (and by any serializer's own writer, when encoding a
cross-document reference) to ask "how does THIS format address objects by fragment?"
rather than assuming `eobject-address.ts`'s grammar universally.

Why this exists: `@typemf/xmi` targets real EMF's own fragment grammar
(`//@feature.index`, bare ID values), which is a different string format from this
package's own default (`/0/feature/2`, `ClassName_id`). Without a per-format override,
`ResourceSet.resolve()` - which lives here, format-agnostically - could only ever
understand one grammar, and an XMI-sourced proxy would fail to resolve. A serializer
that doesn't implement these (e.g. `@typemf/json`, whose grammar already IS this
package's default) is unaffected - the fallback to `eobject-address.ts`'s functions is
exactly its existing behaviour.

This is also what makes cross-format references correct: a JSON document referencing an
object that lives in an XMI document (or vice versa) needs the fragment written in the
TARGET's grammar, not the writer's own - `Resource.getSerializer()` exists specifically
so a writer can ask the target resource which format owns it. See
`@typemf/xmi`'s `cross-format.test.ts` for both directions proven against actual bytes,
not just successful resolution.

Deliberately NOT a shared-traversal refactor between `@typemf/json` and `@typemf/xmi`'s
fragment-computation code (that was explicitly decided against) - this is additive to
the `EObjectSerializer` interface only; each format's own grammar implementation stays
independent.

## Test coverage pass: four real gaps found by surveying existing tests against source, one a real bug

Surveyed all 15 existing test files against every source file to find genuinely untested
non-trivial behavior, not just pad coverage numbers. Three confirmed the existing
implementation is already correct (good signal, not wasted effort); one was a real bug:

- **`EEnumImpl.freeze()` was missing entirely.** When `freeze()`/`isFrozen()` was added,
  `EClassImpl` and `EPackageImpl` both got cascading overrides (matching real EMF's own
  `EClassImpl.freeze()`/`EPackageImpl.freeze()`); `EEnumImpl` was missed, so an enum's literals
  never actually froze even when the whole owning package did. Confirmed against real EMF's
  `EEnumImpl.freeze()` (which does cascade to `eLiterals`) before fixing. See `freeze.test.ts`.
- Diamond/multiple inheritance in `EClassImpl.recomputeAllLists()` was entirely untested despite
  `eSuperTypes` being many-valued - every existing fixture used single-chain hierarchies only.
  Added a genuine diamond (two branches sharing a common ancestor); the existing `Set<EClass>`
  dedup already handles it correctly. See `eclass-reflection.test.ts`.
- `BasicEList`'s reference-uniqueness rule (`rejectsDuplicate`) was only ever exercised for
  containment references; non-containment many-valued references were untested. Confirmed
  correct with a dedicated fixture. See `dynamic-eobject.test.ts`.
- `getResourceOf()`'s root-walking loop was only ever exercised (indirectly) with targets that
  were likely already roots. Added a direct test for a genuinely nested, non-root object. See
  `resource-set.test.ts`.
