# Deferred / tracked design decisions

## Nunjucks 3.2.4 does not support Jinja2's inline for-loop `if` filter

`{% for x in y if condition %}` - standard Jinja2 syntax - parses without error in this
Nunjucks version but silently produces wrong (empty) output. Verified empirically before
relying on it further (see the design discussion). Every template in `templates/typescript/`
uses a pre-filtered TS helper (`eClassesOf()`, `concreteEClassesOf()`, `singleValuedFeatures()`,
`referencedApiTypes()`) instead of this syntax - if you're adding a new template (for this set
or a new one), don't reach for the inline `if` filter; it will not do what you expect.

## Multiple EClass inheritance is not supported (v1 scope)

A TS class can only `extends` one other class. Real Ecore/EMF supports an `EClass` having
several `eSuperTypes` (Java handles this via "first supertype becomes the superclass, the
rest become additionally-implemented interfaces"). `superType()`/`superTypeChain()` in
`typescript-filters.ts` only ever look at `eSuperTypes.get(0)` - a second or later declared
supertype is silently ignored by the generator today.

**Tracked for:** if/when a real metamodel needs multiple EClass inheritance, extend the `api`
interface to `extends FirstSuper, SecondSuper, ...` (TS interfaces support multiple
inheritance fine) while keeping the `gen`/`impl` class chain single-rooted - the API layer can
honestly reflect multiple inheritance even though the implementation layer can't.

## Real EMF's "body" GenModel annotation vs. our own operation-body annotation

Deliberately NOT reusing real EMF's own convention (source
`http://www.eclipse.org/emf/2002/GenModel`, details key `body`) for operation bodies, even
though we DO reuse that exact source/key for `documentation`. EMF's `body` value is
unambiguous Java source because EMF only ever generates one language; we support multiple
simultaneous template sets, so a bare shared `body` key would be ambiguous - or actively
wrong, if a real EMF-authored `.ecore` file happens to already carry Java in it and gets read
by a non-Java template set. Our own annotation (source `https://typemf.dev/generator`, details
key `body:<templateSetName>`) scopes the body to the target language explicitly. See
`typescript-filters.ts`'s `operationBody()`.

## ESM-only, no CJS build

`typescript-template-set.ts` resolves the built-in templates' folder via `import.meta.url`
(needed to find `templates/typescript/` regardless of whether this package is running from
`src/` or `dist/`). `import.meta` is empty under CJS, which would silently corrupt template
path resolution rather than failing clearly - found via tsup's own build warning, not assumed.
Since this package is already Node-only and devDependency-only (never a runtime dependency of
anything shipped), and nothing in this project consumes it via `require()`, the fix was
dropping CJS support entirely rather than working around the empty-`import.meta` case: a `require()`
attempt now gets Node's own clear `ERR_REQUIRE_ESM`, not a confusing "template not found" error.

## Real circular-import hazards found and fixed while building the typescript template set

Two genuine ES-module circular-import bugs surfaced only by actually compiling AND running
generated code (not by reading it) - worth understanding both if extending `epackage.njk` or
`efactory.njk`, since it's easy to reintroduce either by "simplifying" the generated shape:

1. **Package must never import Factory's classifier-ID constants.** `Factory`/`Switch` embed
   each classifier's ID as a numeric literal directly in their `switch` statements (computed by
   the generator at generation time), rather than referencing a named constant on `Package`.
   This was a deliberate design choice made before writing any template code specifically to
   avoid a `Package <-> Factory` cycle over ID constants.

2. **Package must construct its Factory lazily, not eagerly.** `Factory` transitively imports
   every concrete `*Impl` class, each of which imports `Package` back (for `eClass()`/feature
   accessors) - a real, unavoidable mutual dependency, not one reorderable away. Constructing
   `new {Name}Factory()` inside `Package`'s constructor - itself running as part of the eager
   `static readonly eINSTANCE = new {Name}Package()` class-field initializer - uses the
   `Factory` import's value before that module has finished evaluating in the circular graph,
   which throws (`"XFactory is not a constructor"`) depending on which module happens to be the
   entry point. Fixed by overriding `getEFactoryInstance()` to construct-and-cache on first
   call instead of in the constructor - by the time anything actually calls it, module loading
   has long since completed. See the comment in `epackage.njk` at the point this is done.

## Ecore self-hosting: proven once (Meta-prefixed, tested), then rebuilt with real names for hand-integration

`src/ecore-seed.ts` hand-authors a real, scoped subset of Ecore's own metamodel (10 metaclasses:
`EModelElement`, `EAnnotation`, `ENamedElement`, `ETypedElement`, `EClassifier`,
`EStructuralFeature`, `EAttribute`, `EReference`, `EClass`, `EPackage`) using real Ecore's own
`nsURI`/`nsPrefix`/classifier names.

**This does not replace `@typemf/core`'s own hand-written `EClass`/`EAttribute`/etc.** as
published, importable exports - it produces a separate, standalone generated
`EcorePackage`/`EcoreFactory`, intended to be copied into `@typemf/core`'s own source tree by
hand, not consumed as a second package alongside it.

**Deliberately excluded from the seed graph**: `EDataType`, `EEnum`, `EEnumLiteral`,
`EOperation`, `EParameter`, `EFactory` as modeled classifiers (the three primitive `EDataType`s
the included classes' own attributes need - `EString`/`EInt`/`EBoolean` - are still present,
just not as their own generated classes). The 10 included classes already exercise every case
that matters for proving viability; the excluded ones would add breadth, not new risk.

**A real, general bug found and fixed here, not specific to the naming collision below:** the
`gen/` layer's import-exclusion logic incorrectly reused the `api/` layer's "exclude the
supertype's name" rule. That's correct for `api/` (which separately imports the supertype for
its `extends` clause) but wrong for `gen/` (which never imports the plain supertype name, only
`{Super}Gen`) - so a class whose own feature happens to have the same type as its supertype
(`EAnnotation`'s `eModelElement: EModelElement` feature, where `EModelElement` is also
`EAnnotation`'s supertype) silently lost a needed import. This could affect any metamodel with
that shape, not just this bootstrap - fixed in `eclass.njk`'s `gen/` import section, and this fix
is permanent/kept regardless of the naming decision below.

**A real, EXPECTED naming collision, confirmed empirically before this file settled on its
current shape:** using real Ecore's own classifier names (`EClass`, `EAttribute`, `EReference`,
`EClassifier`, ...) produces generated TypeScript that collides with `@typemf/core`'s own
hand-written exports of the identical names when both are imported into the same file -
`gen/EClassGen.ts` imports both `EClass` from `@typemf/core` (for `EObjectImpl`/type
annotations) and `EClass` from `../api/EClass.js` (for `implements EClass`), a genuine duplicate
identifier. This was verified two ways:

1. First, with every classifier prefixed `Meta` (`MetaEClass`, `MetaEAttribute`, ...) - avoids
   the collision entirely, and was type-checked with the TypeScript compiler API against the
   real, built `@typemf/core` AND actually executed (factory instantiation, 5-level inheritance
   with correct `super.eGet()`/`eSet()` delegation, both self-referential cases -
   `EReference.eOpposite: EReference` and `EClass.eSuperTypes: EClass[]` - and real containment
   through generated classes). This proved the generator's own logic is correct.
2. `ecore-seed.ts` was then reverted to real, unprefixed names for actual delivery, since the
   intended next step is copying the output into `@typemf/core`'s own source tree by hand, where
   the import story is different (relative paths within core itself replacing the generated
   files' `from '@typemf/core'` lines, not two separate packages' exports colliding). **The
   output in this shape has NOT been re-verified by compiling or testing it** - deliberately, so
   the delivered files reflect real names exactly, with verification left for after integration
   (or for a future import-aliasing feature - see below - if standalone compilation without
   integration is wanted later).

**Tracked for:** if a standalone (non-integrated) real-named version is wanted again later, the
generator would need collision-aware import aliasing (`import { EClass as CoreEClass } from
'@typemf/core'`) - a real, moderate, well-bounded generator feature (checking against the known,
enumerable list of names the templates themselves hardcode - see the "where does the collision
happen" discussion), not attempted here since copying real-named output into `@typemf/core`
directly doesn't need it.

## Not yet covered by any test

- Multi-line EOperation bodies with embedded template-literal-breaking characters (backticks,
  `${`) in the annotation value - the body is spliced into generated code as-is; a body
  containing a literal backtick inside one of our own generated template-literal error
  messages elsewhere in the same file could theoretically produce invalid syntax. Narrow, but
  untested.
- A metamodel with zero classifiers, or a package with only `EDataType`s and no `EClass`/`EEnum`
  at all (would exercise `Package`/`Factory`/`Switch` each degenerating to an empty-but-valid
  shape).
- `EReference` many-valued non-containment features specifically in generated code (tested
  thoroughly in `@typemf/json`/`@typemf/xmi`'s own serializer logic, but not through the
  generator's own templates against a live generated class).

## The CLI's ecoreFile loading is honestly stubbed - @typemf/core's .ecore parser doesn't exist yet

`ecore-loader.ts`'s `loadEcorePackage()` throws a clear, specific error rather than doing
anything with the path it's given. `@typemf/core`'s `ecore/` folder (XML text -> EPackage) has
been tracked as "temporary scaffolding, not yet built" since early in this project's planning -
this CLI is the first piece to actually need it for the general case (pointing the CLI at an
arbitrary real `.ecore` file on disk).

This does NOT block generating code for a programmatically-built `EPackage` (call `generate()`
directly, bypassing the CLI's config-file/file-loading layer entirely) - which is also the
*correct* way to bootstrap Ecore's own metamodel specifically, since parsing a `.ecore` file to
build the very first `EPackage` that describes `.ecore` files is circular by construction; every
real implementation solves this via a hand-authored seed graph, not by parsing.

**Tracked for:** building `@typemf/core`'s `ecore/` parser (same dual-environment DOM approach
already used for `@typemf/xmi` - native `DOMParser` in-browser, `@xmldom/xmldom` in Node), then
wiring `loadEcorePackage()` to actually call it. At that point the CLI works against any real
`.ecore` file, not just programmatically-built packages.

## Template set registration is built-ins only (v1 scope)

`template-set-registry.ts`'s `resolveTemplateSet()` only knows the string `"typescript"`. A
third-party template set (e.g. a Java one, per the original "extensions can contribute their
own templates" design goal) has no registration mechanism yet - adding one is a natural next
step once a second template set actually exists to register.

## EAnnotations are now queryable at runtime, scoped to package/classifier/feature/enum-literal

Real, live `EAnnotation`s (source + `details`) now survive the full pipeline: parsed from a
real `.ecore` file into the dynamic graph (already worked, via the generic containment-child
reader), carried forward by `ecore-dynamic-to-typed.ts`'s new `copyAnnotations()` helper, and
reconstructed as real runtime `EAnnotationImpl` objects by generated `Package.ts` construction
code (via `epackage.njk`'s new `emitAnnotations()` macro) - so `eClass.getEAnnotation(source)`
genuinely works on a compiled, running, generated `EcorePackage`-equivalent, not just as a
source-level JSDoc comment. Verified end to end: real annotation values (including an
apostrophe and embedded double quotes - the exact cases `jsString()` exists for) generated,
compiled with the real TypeScript compiler, executed, and queried back correctly at all three
levels (package, classifier, feature).

**Deliberately excluded: EOperation-level annotations.** Operations have no runtime
representation in the converted metamodel graph at all yet - 23 real operations across 8
classes in real Ecore.ecore (`EClass`, `EClassifier`, `EEnum`, `EFactory`, `EModelElement`,
`EOperation`, `EPackage`, `EStructuralFeature` - see the precise per-class breakdown from the
design discussion) have no `EOperationImpl` built for them, so there's nowhere for an
operation-level annotation to attach. Narrow in practice (operation-level documentation is less
commonly populated than class/feature-level), but real - tracked as a prerequisite for closing
this fully, not attempted here.

## jsString() now fails loudly on undefined, rather than silently emitting malformed code

Found by the annotation work, not by inspection: `jsString(undefined)` previously produced
`JSON.stringify(undefined)`, which is the JS value `undefined`, not a string - Nunjucks renders
that as an empty interpolation, so a template line like `this.setNsPrefix({{ jsString(x) }});`
would silently become `this.setNsPrefix();`, a TypeScript compile error only caught much later
(if ever) rather than a clear failure at generation time. `jsString()` now throws immediately,
naming exactly what's missing. This is not hypothetical - it caught a genuine, pre-existing gap
in `derived-features.test.ts`'s own fixture (`nsPrefix` was never set), silently working before
this guard existed purely because nothing downstream happened to touch that particular output.

## Real bug found re-running against the real Ecore.ecore file: derived-feature flags were never copied forward

`ecore-dynamic-to-typed.ts` constructed every EAttribute/EReference from a parsed .ecore file
without copying `changeable`/`volatile`/`transient`/`derived`/`unsettable` from the dynamic
source at all - meaning every converted feature silently defaulted to changeable=true and
everything else false, regardless of what the real file actually declared. Concretely, this
broke the generator's own `TRIVIAL_DERIVED_FORMULAS` treatment (which checks
`feature.isDerived()` first) for every feature converted from any real .ecore file, including
real Ecore.ecore itself: `required`/`many`/`container`/`eReferenceType`/`eAttributeType` were
all generating as ordinary stored fields, not the intended formulas, silently, since generation
succeeded without error either way - only the generated *content* was wrong.

Found by inspecting the regenerated real output directly (`getRequired()` returned
`this._required`, not the formula) rather than by a failing test - none of the existing tests
happened to set these flags on a dynamic fixture, so nothing caught it structurally. Fixed with
a new `copyFeatureFlags()` helper in `ecore-dynamic-to-typed.ts`, called for both EAttribute and
EReference construction, and a dedicated test proving the flags actually survive conversion
(`ecore-dynamic-to-typed.test.ts`). Re-verified against the real file after the fix:
`getRequired()`/`getMany()`/`getContainer()`/`getEReferenceType()`/`getEAttributeType()` all now
correctly emit their real formula bodies.

## Comprehensive integration test against the real Ecore.ecore file

`src/__tests__/real-ecore-full-validation.test.ts`, with the real file now committed as a proper
fixture (`src/__tests__/fixtures/Ecore.ecore`) rather than a `/tmp` path. Goes well beyond the
existing `ecore-loader.test.ts` (which proves the mechanism works at all, on a small hand-written
file): 89 assertions checking the full, real file's actual information survives loading -
structural completeness across all 52 classifiers by name, a generic per-class own-feature-count
cross-check against the raw XML (mechanically extracted, not hand-counted, so it can't silently
drift from the real file), and deep, hand-verified checks on a representative set of classes
covering every information kind the format carries: abstract flags, multi-level inheritance,
attribute/reference/containment/opposite wiring (including confirming `eOpposite` points at the
*real* feature object in both directions), the derived-feature flags
(`changeable`/`volatile`/`transient`/`derived`) that were the subject of a real bug fixed earlier
in this project, real GenModel/Ecore constraint annotations with their real source and details,
`EObject`'s deliberate exclusion (both as a classifier and as a feature type, via `EAnnotation`'s
`contents`/`references`), and `EGenericType`'s self-referential structure. All 89 pass against the
real file, unmodified.
