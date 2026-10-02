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

**Tracked for:** if/when a real metamodel needs multiple EClass inheritance, extend the `types`
interface to `extends FirstSuper, SecondSuper, ...` (TS interfaces support multiple
inheritance fine) while keeping the `impl` class chain single-rooted - the `types` layer can
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
_correct_ way to bootstrap Ecore's own metamodel specifically, since parsing a `.ecore` file to
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
succeeded without error either way - only the generated _content_ was wrong.

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
_real_ feature object in both directions), the derived-feature flags
(`changeable`/`volatile`/`transient`/`derived`) that were the subject of a real bug fixed earlier
in this project, real GenModel/Ecore constraint annotations with their real source and details,
`EObject`'s deliberate exclusion (both as a classifier and as a feature type, via `EAnnotation`'s
`contents`/`references`), and `EGenericType`'s self-referential structure. All 89 pass against the
real file, unmodified.

## Gen/Impl merged into a single, fully-generated impl/ layer; api/ renamed to types/; Factory split; Switch moved to util/

The three-layer `api`/`gen`/`impl` split (and the parallel single-file `Factory`/`Switch`) is
gone, replaced by a layout matching real EMF's own generated output exactly:

```
types/{Name}.ts              interface, per classifier
{Pkg}Package.ts              interface, root
{Pkg}Factory.ts              interface, root (NEW split - was one file)
impl/{Name}Impl.ts           concrete, fully generated (was api/gen/impl split into three)
impl/{Pkg}PackageImpl.ts     concrete, unchanged
impl/{Pkg}FactoryImpl.ts     concrete (NEW split)
util/{Pkg}Switch.ts          moved from the package root
```

**Why the merge is correct now, when it wasn't earlier:** Gen/Impl was justified specifically
because there was no merge tool - Gen had to stay always-safe-to-overwrite, Impl had to stay
never-regenerated so hand-edits would survive. That reasoning held right up until customization
moved to subclassing (`extend {Name}Impl`, override `createX()` on a custom `Factory`) instead of
hand-editing the generated Impl file directly. Once that shift happened, nothing hand-written goes
into `impl/{Name}Impl.ts` either - the original reason for keeping it a separate,
never-regenerated layer had already stopped applying, it just hadn't been acted on until now.

**One real behavioral consequence, not just a rename:** `impl/{Name}Impl.ts` is what `Factory`
directly instantiates (`new {Name}Impl()`), so it can no longer have any `abstract` members the
way the old `{Name}Gen` could. An `EOperation` with no `body:typescript` annotation previously
generated an `abstract` method, relying on the (now-removed) separate Impl layer to fill it in.
It now generates a method with a clear throwing body instead
(`throw new Error('X.y() has no body:typescript annotation - nothing to generate.')`) - the
honest behavior for fully-generated code with no further hand-editable layer, rather than
silently failing to compile or silently doing nothing.

**`api/` -> `types/`**: purely a rename (clearer purpose - "types" over the more Java-flavored
"api"), no behavioral change.

**`Factory` split into interface (root) + impl** (`{Pkg}FactoryImpl.ts`), matching `Package`'s
existing split and real EMF's own `DlFactory`/`impl/DlFactoryImpl` shape. Unlike `Package`,
`Factory` needs no `eINSTANCE`/`init()` singleton pattern of its own - it's constructed once,
inside `Package`'s own `init()`, and accessed via `{Pkg}PackageImpl.eINSTANCE.getEFactoryInstance()`
if needed elsewhere.

**`Switch` moved into `util/{Pkg}Switch.ts`**, matching real EMF's own layout exactly.
`AdapterFactory` (also under real EMF's `util/`) has no equivalent here and stays out of scope -
EMF.Edit territory, relevant only to future editor work, not code generation.

All existing tests that asserted specific file paths (`gen/XGen.ts`, `api/X.ts`,
`LibraryFactory.ts` as a constructible class, `LibrarySwitch.ts` at the root) were updated to
match - 140/140 passing, including the full compile-and-run end-to-end tests, confirming the new
layout works, not just that it looks right.

## Three template changes: index.ts per folder, isX() naming for boolean getters, primitive types without | undefined

- **`index.ts`/`types/index.ts`/`impl/index.ts`** (new `index.njk`), each scoped to its own
  folder only (not aggregating across folders) - re-exports everything in that folder.
- **`beanGetterName()`**: a single-valued `EBoolean` attribute's getter is now `isX()`, not
  `getX()` - the setter is unaffected (`setX` regardless), and many-valued booleans are
  unaffected (an `EList<boolean>` has no sensible "isX" reading).
- **`isPrimitiveValueType()`/`tsOptionalScalarType()`/`primitiveDefaultValue()`**:
  `EBoolean`/`EInt`/`ELong`/`EFloat`/`EDouble`/`EShort`/`EByte` map to real TS primitives with a
  genuine zero-default (`false`/`0`) and no longer get `| undefined` - mirrors real Java EMF's
  own primitive-vs-wrapper distinction exactly (these seven correspond to Java's primitive
  types; the `*Object` variants are the wrapper counterparts and still get `| undefined`).
  ELong/EShort/EByte were extended to this treatment by the same reasoning as EInt/EFloat/
  EDouble even though only four were named explicitly in the request that added this - flagged
  as an interpretive extension. This change reaches further than the getter/setter signature:
  `eIsSet()` for a primitive field now compares against its real default (matching how
  `@typemf/core`'s own hand-written classes already do this) instead of `!== undefined`, which
  would otherwise always be `true`; `eUnset()` resets to the default instead of assigning
  `undefined`, which would otherwise be a type error.

All three verified with real compilation, including a dedicated test importing exclusively
through the new index files (`index-generation.test.ts`) to prove they're genuinely resolvable,
not just plausible-looking text.

## Two items from the same request explicitly deferred - not gaps, decisions

- **`instanceClassName`-based EDataType naming (item 5 of that request)**: needs
  `getInstanceClassName()`/`setInstanceClassName()` added to `@typemf/core`'s `EClassifierImpl`
  first (currently dropped during conversion - see the earlier note on `ecore-dynamic-to-typed.ts`),
  which is out of this package's scope. The person is making that `@typemf/core` change
  themselves; the generator-side three-tier name resolution (EAnnotation `typescript-type` detail
  -> `instanceClassName` -> plain name) is not yet built, waiting on that.
- **`abstract class` instead of `interface` for `types/{Name}.ts` (item 3)**: postponed, still
  being decided. The real problem, worth remembering when this comes back: `implements` in
  TypeScript is purely compile-time and gives zero `instanceof` benefit regardless of whether the
  implemented thing is an `interface` or an `abstract class` - and `{Name}Impl` already spends its
  one `extends` slot on `{Super}Impl` for real field/method inheritance, so it can't also
  `extends {Name}` for a real prototype-chain relationship. Three routes were laid out: (1,
  recommended) a static `Symbol.hasInstance` on each abstract class, checking the instance
  reflectively against the real metamodel `EClass` hierarchy - correct `instanceof` behavior,
  zero restructuring of the existing `{Name}Impl extends {Super}Impl implements {Name}` shape;
  (2) flatten inherited features directly into the abstract classes and have `{Name}Impl extends
{Name}` - real prototype-chain `instanceof`, but a substantially bigger change that also
  inverts which folder holds the real logic; (3) accept only-partial `instanceof` correctness.

## RESOLVED: overloaded EOperations generate invalid TypeScript (two method bodies, same name)

Real `Ecore.ecore` has genuine overloaded operations - e.g. `EEnum` declares
`getEEnumLiteral(name: EString): EEnumLiteral` and `getEEnumLiteral(value: EInt): EEnumLiteral`
as two separate `EOperation`s with the same name. `eclass.njk` used to loop
`for op in eClass.getEOperations()` and emit one full method per operation, unconditionally, with
no grouping-by-name step - two same-named operations produced two full method declarations with
bodies in the same class, which TypeScript rejects outright.

**Fixed, scoped to same-arity overloads only (explicit decision, not a limitation discovered
after the fact):** `groupOperationsByName()` groups a class's own operations by name. A name with
one operation generates exactly as before. `types/{Name}.ts` needed no change at all - TS
interfaces support overloads natively, so the existing per-operation loop already produced valid
overload signatures. `impl/{Name}Impl.ts`'s loop now emits, per group of 2+: every overload
signature with no body, followed by exactly one implementation signature via
`mergedParamList()`/`mergedReturnType()` - each parameter position's type the union of every
overload's type there, with the name synthesized from every overload's own name at that position
(`name`/`value` -> `nameOrValue`). Always throws regardless of any individual overload's own
`body:typescript` annotation - dispatching to a specific overload's real body based on
runtime-`typeof`'d merged arguments is a bigger feature not attempted here; every overload real
Ecore.ecore actually has is bodyless anyway.

Verified with a dedicated test (`overloaded-operations.test.ts` - real compilation, zero
TypeScript errors) and confirmed directly in the real Ecore.ecore output: `EEnumImpl.ts` generates
`getEEnumLiteral(name: string): EEnumLiteral;` / `getEEnumLiteral(value: number): EEnumLiteral;` /
`getEEnumLiteral(nameOrValue: string | number): EEnumLiteral { throw ...; }`.

## RESOLVED: imports now go through the index files, and a relative-import mode exists for self-hosting into @typemf/core

**a) `index.ts` files are now actually used for imports.** `efactory.njk` and `eswitch.njk` (the
two templates that used to loop over every classifier importing its `types/`/`impl/` file
individually - the most repetitive cases) now import once from `../types/index.js` / `./index.js`
and destructure everything from that single statement. `eclass.njk`'s own per-classifier
cross-references (superclass, `referencedApiTypes()` entries) still resolve to specific sibling
files rather than the index - that's a different, narrower case (a handful of specific names, not
"every classifier") and was left as-is; only the "import every classifier" pattern was collapsed.

**b) `coreImportSpecifier(location, kind, options)` implements the `generate-ecore` relative-import
mode.** The real design question flagged before implementing this - where would generated output
actually live inside `@typemf/core`'s tree, which determines the relative depth back to every
core symbol - is now answered concretely, from the person's own already-integrated
`@typemf/core`: generated classifier files sit as **plain siblings** in the _same_ `types/`/
`impl/`/`util/` folders as `@typemf/core`'s own foundational classes (`EObject`, `EObjectImpl`,
`BasicEList`, ...), confirmed by reading that structure directly - `types/EAttribute.ts` and
`impl/EAttributeImpl.ts` there already use ordinary same-folder/cross-folder relative imports for
everything, no package boundary at all. That answer collapsed what looked like it might need a
real symbol -> path lookup table into a small, fixed depth table (`root`/`types`/`impl`/`util` x
`types`/`impl`), reused for every `@typemf/core` import across all four templates - normally
`'@typemf/core'`; in `generate-ecore` mode, the correct relative path for the calling template's
own location.

Verified two ways: a dedicated test (`import-modes.test.ts`) checking both the default
(`'@typemf/core'`) and `generate-ecore` (relative, correct depth per of four output locations)
cases via real generated content, not just successful compilation; and confirmed directly in a
full real-Ecore.ecore regeneration in `generate-ecore` mode - zero `'@typemf/core'` imports
anywhere across all 46 files, every relative path resolving correctly (e.g.
`impl/EAttributeImpl.ts`: `from '../types/index.js'` for types-shaped symbols, `from
'./index.js'` for impl-shaped ones).

## TODO: EJavaClass has no real TypeScript mapping yet

`tsPrimitiveType()` has no `case 'EJavaClass'` at all - confirmed by reading it directly - so it
falls into the `default` branch and emits the classifier's own name, `"EJavaClass"`, as a bare
nominal type. That resolves to nothing anywhere in generated output; any feature typed
`EJavaClass` (e.g. `EClassifier.instanceClass` in real Ecore.ecore, which uses exactly this type)
currently generates a reference to an undefined type name.

**The real mapping, decided in discussion, not yet implemented:** a constructor type, since a
JS/TS class _is_ its own constructor function - the same "reference to the class itself, not an
instance of it" relationship `Class<T>` has in Java:

```ts
type JavaClass<T = unknown> = new (...args: any[]) => T;
```

Parameterized where the specific type is known (`JavaClass<Book>`); falls back to the
unparameterized `JavaClass` (i.e. `JavaClass<unknown>`) for the bare-`EDataType` case, which is
how `EJavaClass` is actually used today (registered generically in the meta-schema, no type
argument attached).

**Worth remembering when this is implemented:** if `EJavaClass` ever needs to represent an
_abstract_ Java class, `new (...args) => T` is too strict (abstract classes can't be
constructed with `new` directly) - TypeScript's `abstract new (...args: any[]) => T`
construct-signature form (4.2+) is the correct alternative for that case, if abstractness is
something the metamodel actually needs to distinguish.

**A real, acknowledged limit, not a gap to close:** Java's `Class<T>` carries far more reflective
surface (`getSuperclass()`, `getMethods()`, `isAssignableFrom()`, annotations, ...) than any JS
constructor reference does. `instanceof` covers roughly `isInstance()`, `.name` covers roughly
`getName()`, and that's approximately where the overlap ends - a bare constructor type will not
carry deeper reflection if something downstream ever needs it.

Not yet implemented - `JavaClass<T>` doesn't exist anywhere in `@typemf/core` yet, and
`tsPrimitiveType()`'s `EJavaClass` case still needs to be added to actually use it.

## New: reflective isX() type guards, one per classifier, in util/{Pkg}TypeGuards.ts

Directly grew out of a real, hand-written function the person showed while discussing item 3
(`instanceof`/abstract classes, still postponed): `isReference(feature): feature is EReference`,
checking `"isContainment" in feature`. That's a structural (duck-typing) guard, and it works
because `isContainment` happens to be a genuinely distinguishing member of `EReference` among its
siblings - but nothing guarantees an arbitrary generated classifier has an equivalent own member
to key off (a subclass might add nothing of its own, inheriting every feature). So the generated
guards use a different, generally-correct mechanism instead: the object's REAL runtime `EClass`,
checked reflectively via the already-existing `EClass.isSuperTypeOf()` (confirmed present on
`@typemf/core`'s `EClassImpl` before relying on it, not assumed) - correct unconditionally,
including for abstract classifiers (correctly true for any concrete subclass instance) and for
dynamic instances (no dependency on the object's actual JS prototype chain at all, unlike
`instanceof`).

This sidesteps the item 3 discussion entirely rather than resolving it - these are plain callable
functions, not something requiring `instanceof`/`abstract class` to work, so item 3 stays
independently open, unaffected either way.

New template `etypeguards.njk`, producing `util/{Pkg}TypeGuards.ts` (named via the new
`typeGuardsClassName()`, added to match `switchClassName()`'s exact convention - plain package
name + suffix, not `packageClassName()`'s `Package`-suffixed form; caught a real naming mismatch
in my own first attempt by checking the ACTUAL generated filename rather than assuming). One
`isX(obj): obj is X` per classifier in `types/` (`eClassesOf(package)` - enums excluded, since
they're not interfaces).

Verified two ways: a dedicated test (`type-guards.test.ts`) with real compilation, and specifically
the key case a naive per-class check couldn't guarantee - an `AudioBook` instance correctly
satisfies `isBook()` too, since `AudioBook extends Book` - plus correct rejection of an unrelated
classifier and safe (non-throwing) handling of `null`/`undefined`/primitives/plain objects; and
confirmed directly in a real Ecore.ecore regeneration (`util/EcoreTypeGuards.ts`, `isEAttribute`
etc. generated correctly, using the exact same reflective mechanism as the hand-written
`isReference` this was modeled on, just generalized to every classifier automatically).

## RESOLVED: duplicate imports in generate-ecore mode, when a real Ecore.ecore classifier name coincides with a core-foundational symbol name

Real Ecore.ecore genuinely models classifiers literally named `EClass`, `EStructuralFeature`,
`EFactory`, etc. - not something an ordinary user metamodel would ever do, which is why this only
ever affects self-hosted Ecore.ecore generation. Confirmed by generating the real file in
`generate-ecore` mode and scanning every one of the 47 output files for duplicate imported
names, not assumed: `EClassImpl.ts`, `EOperationImpl.ts`, `EReferenceImpl.ts`,
`EStructuralFeatureImpl.ts` (all via `eclass.njk`'s unconditional core-symbol import colliding
with the classifier's own self-import or a `referencedApiTypes()` entry), and
`EcoreFactoryImpl.ts`/`EcoreFactory.ts` (via `efactory.njk`'s fixed `EClass`/`EFactory`/`EObject`
import colliding with its `concreteEClassesOf()` loop - the exact case originally reported).

**Fixed with `excludeCollidingCoreNames()`/`coreImportLine()`**: filters a requested core-symbol
list to drop any name that's also a real classifier in this package, since whichever _other_
import already brings that name into scope (the classifier's own self-import, a
`referencedApiTypes()` entry, or a `concreteEClassesOf()`/`eClassesOf()` loop) is - in every such
case - a real classifier of this exact package, so nothing is actually lost by not
double-importing it. Emits nothing at all (not an empty `import {}`) if every requested name
collided. Wired into `eclass.njk` (both files) and `efactory.njk` (both files); `epackage.njk`,
`eswitch.njk`, and `etypeguards.njk` don't need it - confirmed they have no second import line
that could ever bring the same core name back in.

A third, distinct instance of the same underlying pattern was found and fixed separately:
`EcoreFactoryImpl.ts`'s own `EFactory`-unification special case (`import { EFactoryImpl } from
'./EFactoryImpl.js'`) collided with its _own_ `concreteEClassesOf()`-based classifier-impl loop,
which also brings in `EFactoryImpl` (since `EFactory` is itself a concrete classifier). Fixed by
excluding `EFactory`'s own `Impl` name from that loop specifically when the unification case
applies.

**Verified**: a full scan for duplicate imported names across every one of the 47 real
Ecore.ecore output files, in `generate-ecore` mode - zero duplicates, confirmed mechanically,
not by spot-checking the two files originally reported.

## TODO: a genuinely different, NOT YET FIXED problem - method-name collisions, distinct from the import-collision issue above

Found while verifying the fix above by actually compiling the real self-hosted output (not just
scanning for duplicate imports): `EcorePackage.ts` declares `getEAnnotation(): EClass` - the
per-classifier metamodel accessor `epackage.njk` generates for every `EClass`-kind classifier
(`get{ClassifierName}(): EClass`), which fires for "EAnnotation" since it's a real classifier in
Ecore.ecore - but `EcorePackage extends EPackage`, and `EPackage` inherits
`EModelElement.getEAnnotation(source: string): EAnnotation | undefined` (the _reflective_
"look up an attached annotation by source URI" operation). Both are named `getEAnnotation`;
TypeScript correctly rejects the interface as incompatible.

This is NOT the same bug as the import-collision issue - it's a method name colliding with an
_inherited operation name_, not two imports of the same symbol. The general shape: **any real
Ecore.ecore classifier whose name coincides with an existing `EModelElement`/`ENamedElement`/
`EPackage` operation name** (`getEAnnotation` is the one confirmed instance; others may exist -
not yet exhaustively checked) will hit this. Needs its own analysis before fixing - not attempted
here, to avoid rushing a second, different kind of naming-collision fix in the same pass as the
first. `Ids`-based dispatch and the `Package`/`Factory`/`Switch`/`TypeGuards` files are unaffected
(they never call the per-classifier accessor by this ambiguous name internally); this is purely
an interface-declaration conflict.

Separately, confirmed (not new) while doing this real compilation: `EJavaClass`/`EJavaObject`
references in `EClassifierImpl.ts` (from `instanceClass`) resolve to nothing, exactly matching
the already-tracked, not-yet-implemented `EJavaClass` TypeScript mapping TODO above - this is
that same gap surfacing in real compiled output, not an additional problem.

## RESOLVED: operation return types now respect the operation's OWN declared multiplicity

Real Ecore.ecore's own `EModelElement.getEAnnotation(source)` declares no `lowerBound` at all -
real EMF's default there is 0 (not required), meaning the operation is genuinely allowed to
return nothing when no annotation with that source is attached. The generator previously
ignored this entirely: operation return types were always the bare `tsScalarType(op.getEType())`,
in both `types/` and `impl/`, with no `| undefined` regardless of what the source metamodel
actually declared.

**Two real, distinct gaps, both fixed:**

1. `ecore-dynamic-to-typed.ts`'s operation-construction loop never copied `lowerBound`/
   `upperBound` at all - for the operation's own return type, or its parameters. Fixed: both
   are now copied, for both.
2. Even where the information existed (e.g. structural features, which already track this),
   operations never consulted it. Fixed with a new `tsOperationReturnType(op)`, deliberately
   NOT reusing `tsOptionalScalarType()` (used for structural feature getters): that function
   appends `| undefined` unconditionally for every non-primitive type, which is the right
   default for features but would be wrong for most operations - things like
   `isSuperTypeOf(): boolean` or `getClassifierID(): number` are genuinely never-null by their
   own declared multiplicity, and blanket-optioning every operation's return type would be
   incorrect. `tsOperationReturnType()` checks the operation's own `isRequired()` (after the
   same primitive short-circuit `tsOptionalScalarType()` already uses) instead of assuming.
   `mergedReturnType()` (the overloaded-operations merge) was updated to use it per-overload too.

**Verified three ways:**

- A dedicated conversion-level test (`ecore-dynamic-to-typed.test.ts`) proving `lowerBound`
  survives conversion correctly for both an operation and its parameter, matching real
  Ecore.ecore's own `getEAnnotation(source)` shape exactly (operation not required, parameter
  required).
- The existing end-to-end tests already exercised both branches once corrected: the not-required
  case (`overloaded-operations.test.ts`'s `find` operations, which never declared a lowerBound,
  correctly gained `| undefined` once the fix was in) and the required case
  (`generate-operations-and-enum.test.ts`'s `describe` operation, explicitly marked
  `lowerBound=1` since it genuinely never returns undefined - a real, meaningful test of the
  "required" branch, not just a loosened assertion).
- Confirmed directly in a real Ecore.ecore regeneration: `EModelElement.getEAnnotation(source:
string): EAnnotation | undefined` in both `types/EModelElement.ts` and
  `impl/EModelElementImpl.ts`; `EClass.isSuperTypeOf()`/`EClassifier.getClassifierID()` (real,
  primitive-typed operations) correctly remain non-optional regardless of their own declared
  multiplicity, confirming the primitive short-circuit still applies correctly to operations too.

## Fixture updated to a newer Ecore.ecore - one real, concrete difference, confirming an existing tracked gap

The person supplied an updated `Ecore.ecore`; `src/__tests__/fixtures/Ecore.ecore` replaced with
it (confirmed via `diff` against the previous version, not assumed). Exactly one real difference:
`EJavaObject` now carries a real annotation -
`source="https://typemf.dev/generator"`, `details key="typescript-type" value="unknown"` -
matching the three-tier `EDataType` naming resolution discussed much earlier (read a
`typescript-type` annotation detail first, then `instanceClassName`, then the plain name), which
was explicitly scoped as the person's own `@typemf/core` work plus a not-yet-built generator-side
piece.

**Confirmed, concretely, that the generator-side piece is still not built**: regenerating with
this fixture shows the annotation itself correctly surviving conversion
(`EcorePackageImpl.ts` correctly attaches it via `getEAnnotations().add(...)`, matching the
existing, working annotation-copying machinery) - but `tsPrimitiveType()` still has no logic
reading it, so `EJavaObject` is emitted as a bare, unresolved nominal type (`EJavaObject | undefined`,
etc.) in over 20 places across the output (`EClassifier.defaultValue`, `EFactory.createFromString`/
`convertToString`, ...) rather than resolving to `unknown` as the annotation now explicitly
requests. This was previously a hypothetical gap; it is now confirmed against a real, concrete
instance in the actual metamodel.

All 150 tests still pass against the new fixture (no regressions from the swap); the
duplicate-import and operation-nullability fixes were both reconfirmed against a fresh
regeneration from it.

## RESOLVED: the real self-hosting bootstrap deadlock - six distinct, layered issues, found and fixed one at a time by actually running the compiled output

Starting point: generated self-hosted `EcorePackageImpl.ts` failed to even load (`Class extends
value undefined`), reported as a single circular-import bug. It was not one bug. Each fix below
reached further before hitting the next, genuinely distinct issue - none hypothetical, all found
by actually building and running the output, not by reading the templates. Listed in the order
discovered, since later fixes depend on earlier ones being in place:

**1. Circular imports via barrel (`index.ts`) files.** In `generate-ecore` mode, same-folder
imports must go through a direct file import (`./EClassImpl.js`), never the barrel
(`./index.js`) - the barrel makes every classifier one giant SCC in esbuild's output.
`coreImportLine()` already had same-folder detection for this; the fix was applying the same
principle to the hand-written, foundational files a real integration merges alongside the
generated output (`EObjectImpl.ts`, `BasicEList.ts`, `DynamicEObjectImpl.ts`,
`DynamicEFactoryImpl.ts`) - these are outside the generator's own output, so this is integration
guidance, not a generator fix: anyone merging generated self-hosted classifiers into an existing
core tree needs to apply the same direct-import fix to these files by hand.

**2. Every many-valued field must be constructed lazily, not eagerly in field initializers.**
`EcorePackageImpl extends EPackageImpl extends ... EModelElementImpl`, and field initializers run
before the subclass constructor body - so an eager `private _eAnnotations = new
BasicEList(this, get{Pkg}Ref().get{Class}_EAnnotations())` field initializer on a class three
levels up the chain tries to call `get{Pkg}Ref()` before `set{Pkg}Ref(this)` (the constructor's
first line) has run. Fixed by making every many-valued field a private cache + private lazy
getter (`eclass.njk`), deferring the `get{Pkg}Ref()` call to first real use - which, correctly,
never happens before the constructor body starts.

**3. The package's own bootstrap fields (name/nsURI/nsPrefix/annotations) were set before their
own metaclass existed.** `this.setName("ecore")` goes through the reflective `eSet()` path, which
needs `ENamedElement.name`'s own metaclass feature object - but that's only built during Pass 2
("attributes/references"), while the package's name was being set at the very start of the
constructor, before Pass 1 even ran. Fixed by moving these calls to the very end of the
constructor (`epackage.njk`, new "Pass 6"), after every classifier and feature metaclass already
exists.

**4. The identical problem recurs one level deeper: every classifier's OWN name (and
abstract/annotations), set during Pass 1 itself, hits the same issue - and this one genuinely
cannot be fixed by reordering,** since classifier names must be set early (later passes reference
classifiers by name) and the very first metaclass ever named is `ENamedElement.name` itself - a
real, irreducible bootstrap circularity, not a sequencing mistake. Root cause: `eSet()`'s (and
`eBasicSetValue`'s) switch dispatch only ever needs `feature.getFeatureID()` - a number the
generator already knows at codegen time (it's the literal `case` label) - so there's no
fundamental need to fetch the metaclass object at all. Fixed by widening `eBasicSetValue` to
accept a plain feature-ID number as well as a real feature (bypassing the metaclass lookup
entirely for that call), and adding an analogous `eBootstrapList(featureId)` for many-valued
fields (named to avoid a genuine, separate collision with `@typemf/core`'s own, pre-existing,
private `eBasicList(feature)` used internally for containment/opposite maintenance - same
concept, different signature, different purpose, needed a different name).

**Critical scoping correction to #4, itself found empirically:** `epackage.njk` is shared between
ordinary metamodel generation and self-hosting. The bypass mechanism above only works when the
runtime metaclasses are themselves _generated_ instances (self-hosting) - for an ordinary
metamodel, they're `@typemf/core`'s own hand-written classes, which don't have
`eBasicSetValue(number)`/`eBootstrapList()` at all, and `Ids` has no entry for foundational names
like `EClassifier`/`EClass` unless the metamodel genuinely declares classifiers with those names.
An unconditional rewrite broke the ordinary case outright (confirmed by the existing test suite,
not assumed). Fixed by making every converted call in `epackage.njk` mode-conditional via two new
macros, `bootstrapSet`/`bootstrapAdd`, which branch on `options['generate-ecore']` - the ordinary,
ID-free reflective bean setter call for ordinary generation, the bypass for self-hosting - never
both from the same call site.

**5. `EAnnotation.details` is a genuinely different shape between the two modes, not just a
different method name.** `@typemf/core`'s own hand-written `EAnnotationImpl` stores `details` as
a plain `Map<string, string>` (a deliberate, earlier design simplification - see much further up
in this file). But self-hosting's _generated_ `EAnnotationImpl.ts` correctly models `details` as
the real, modeled Ecore feature it is: `EList<EStringToStringMapEntry>`, a containment list of
real entry objects. The old `emitAnnotations` macro's `annotation.getDetails().set(key, value)`
was already broken against the self-hosted generated type before this session (confirmed by
checking the actual generated type, not assumed) - it just had never been reachable, because
bootstrap always crashed earlier. Fixed by branching `emitAnnotations` on mode: constructs real
`EStringToStringMapEntryImpl` instances for self-hosting, keeps the `Map`-style call for ordinary
generation.

**6. `classifierID`/`featureID` are real, necessary, internal-only bookkeeping fields that the
ordinary, feature-driven generation has no way to emit**, because they aren't modeled Ecore
features at all - `@typemf/core`'s own hand-written `EClassifierImpl`/`EStructuralFeatureImpl`
declare them directly as ordinary fields with plain get/set methods, for exactly this reason. The
generated classes had no equivalent at all, so bootstrap code calling `.setClassifierID(...)`/
`.setFeatureID(...)` on a generated instance failed outright (`... is not a function`) - not a
bootstrap-ordering problem, a missing-method problem. Fixed by adding the identical field/method
pair directly in `eclass.njk`, declared once on `EClassifier`/`EStructuralFeature` themselves
(inherited by every descendant), gated by a new `isClassifierDerived()`/
`isStructuralFeatureDerived()` helper pair in `typescript-filters.ts`.

**6b. This collided with something new:** real Ecore.ecore genuinely declares
`EClassifier.getClassifierID(): EInt` and `EStructuralFeature.getFeatureID(): EInt` as real,
zero-arg `EOperation`s (confirmed directly against the fixture file, not assumed) - meaning the
ordinary, generic operation-rendering loop _also_ tries to generate a `getClassifierID()`/
`getFeatureID()` method, as a throwing stub (no `body:typescript` annotation exists for either in
the source file). Both declarations share the exact method name; the later one silently wins at
runtime, shadowing the real, hand-added implementation with a stub that always throws. Fixed by
excluding these two specific operations from the impl-side operation loop via a new
`isBookkeepingOperation()` helper, whenever the hand-added version already covers them - the
interface (`types/`) side needed no change, since both declarations agree on the same signature
and interfaces don't have this runtime last-wins problem.

**Also had to fix, while wiring #4/#5/#6 through consistently:** Pass 5
(`recomputeAllLists()`) is now skipped entirely in `generate-ecore` mode - the generated
classifier classes never implement this method at all (the ~14 traversal-based derived features
like `eAllSuperTypes`/`eAllStructuralFeatures` are stored fields on generated classes, not
auto-computed, an already-documented, separate, accepted scope decision from earlier in this
file) - and a missing `EStringToStringMapEntryImpl` import needed adding to the impl-shaped
classifier import list, conditionally (it doesn't exist as an export of `@typemf/core` at all,
by design - see #5).

**Fully, empirically verified end to end** against the real Ecore.ecore fixture: merged the fresh
generator output with the hand-written foundational files (applying the fix from #1 and the
separately-tracked `getEAnnotation` collision workaround from the TODO above, both by hand, as any
real integration currently must), built with `tsup`, and ran real runtime code - package
bootstrap (name/nsURI/nsPrefix), `classifierID`/`featureID` correctly assigned, supertypes
correctly wired (`EAttribute` → `EStructuralFeature`), cross-classifier type resolution
(`EReference.containment` → `EBoolean`), and instance creation via the factory including adding
features to a _new_ instance via the lazy-getter path (the original, first-reported deadlock's
exact scenario) - all confirmed working, not just compiling. All 150 existing tests continued
passing throughout, including the full compile-and-run test for the _ordinary_ (non-self-hosted)
path, confirming none of this affected the common case.

**Not touched, deliberately out of scope for this pass:** the `getEAnnotation` naming collision
documented in the TODO above (worked around by hand for this verification, not fixed in the
generator) and the `EJavaClass`/`EJavaObject` mapping TODO above remain exactly as previously
documented - neither is related to bootstrap ordering, and fixing either here would risk rushing
a different kind of fix in the same pass as six already-substantial ones.

## Import generation rewritten: collect-then-render, never a barrel, `index.njk` removed

Replaced the old, ad-hoc import assembly (`coreImportLine`/`coreImportSpecifier`/
`excludeCollidingCoreNames`, hand-written import lines scattered across every template) with a
single, general mechanism: `ImportCollector` (new `import-collector.ts`) collects every reference
a template makes while a file's body renders, via `useImport(name, location, {foundational})`
called inline at the point of use - never as a separate, hand-maintained list. Once the body is
fully known, `postProcessFile` (a new, generic `TemplateSet` hook, called by `FileExtension` right
after a `{% file %}` block's body is a complete string) renders the deduplicated, sorted, always-
direct-per-file import header and prepends it - no barrel import is ever generated, in either
mode, from any location.

Real bugs this ad-hoc approach had already caused, confirmed and fixed in the process: a duplicate
`EClassifier` import, a missing `EAnnotation` import, a spurious `EString` import (all found
earlier this session), and two more found while building this: `eBootstrapList`'s return type
(`BasicEList<unknown>`) is unconditionally present but was only conditionally registered; and
`referencedApiTypes` never scanned operations at all (only features) - a real, previously-existing
gap, not introduced by this rewrite, that left any classifier/EEnum type appearing only in an
operation's parameter or return type silently unimported. Fixed by adding
`referencedOperationTypes`, scoped to `EClass`/`EEnum` only (not primitives, and not a plain
`EDataType` like `EJavaClass`/`EJavaObject` - `main.njk` never generates a file for those at all,
so registering them as importable was actively wrong, not just incomplete - confirmed directly by
first getting a "Cannot find module" error for exactly that, not assumed).

One genuinely interesting resolution rule, confirmed necessary by actually generating real
Ecore.ecore: `EStructuralFeature` is both a fixed, always-present parameter type (`eGet(feature:
EStructuralFeature)`, on every generated class) and, when self-hosting, one of the metamodel's own
classifiers (registered via `referencedApiTypes` too). Both registrations resolve to the identical
path once the mode is known - so `ImportCollector.add()` merges rather than errors when two
requests for the same name agree on location/file but differ only in `foundational`, preferring
`true` (the more general, correct categorization) rather than treating this as a genuine
collision.

`index.njk` (which generated `index.ts`/`types/index.ts`/`impl/index.ts`, each re-exporting every
file in its own folder) is now deleted entirely, along with its `{% include %}` in `main.njk` -
once nothing generated ever imports through a barrel, generating the barrels themselves serves no
purpose. `index-generation.test.ts` (which existed specifically to test those three files) is
deleted for the same reason; `import-modes.test.ts` rewritten to test the new, correct behavior
(direct imports only, proper `generate-ecore` switching, dedup, stable output) instead of the old,
deliberately-removed barrel behavior it used to assert.

Verified against real Ecore.ecore, merged into the full workspace structure exactly as earlier
verifications in this file were: error count on a strict `tsc --noEmit` dropped from the
pre-refactor baseline to 48, all of them exactly the two already-known, separate, deferred issues

- `EObject` missing from the loaded package entirely (tied to the still-unresolved
  `getEClassifier`/`getEAnnotation` collision, not this rewrite) and `EJavaClass`/`EJavaObject`/
  `EEnumerator` (tracked separately as the not-yet-started "EDataTypes" work). All 157 generator
  tests pass.

## EDataType type text: three layers, no built-in mappings; generics

> **Layer 1 below is superseded** by "Import information: new annotation..." (end of this file): the annotation source and keys changed, and the import source now depends on internal vs external. Layers 2 and 3, type parameters and the collector notes still hold.

Wherever an EDataType occurs (attribute/reference type, operation return type, parameter type, and
every cast/field the templates emit for one), the TypeScript text comes from `resolveDataTypeTs()`
(`typescript-filters.ts`), in strict priority order, and with NO built-in knowledge of any datatype

- every mapping lives in the metamodel; a missing one is a metamodel fix (an annotation), not
  something the generator papers over:

1. The `typescript-type` detail of the annotation with source `https://typemf.dev/generator`, as
   written (not checked, not interpreted - `number | undefined`, `number []` are all fine). If
   `typescript-import-from` is also present, `typescript-type` is registered as a used import from
   there: a value starting with `./` or `../` is relative to the ROOT of the generated package
   (re-expressed per importing folder), anything else is a bare module specifier. Used as written -
   including a missing `.js` extension.
2. `instanceClassName`, as written, if set.
3. The datatype's name, as written.

(An earlier version of this section described a closed Java-to-TS table for layer 2 and a name
switch for layer 3, plus validation of the annotation values. All three were removed on request:
no hard-coded mapping, no checking.) Hand-built test metamodels therefore declare their own
mappings via `annotatedDataType()` (`sample-metamodel.ts`), exactly as real Ecore.ecore now does.

**Type parameters.** A classifier that declares `eTypeParameters` is generic. Wherever it is used, the
emitted text carries one type argument per declared parameter, positionally: the corresponding
`eTypeArguments` entry where present and bound (to a classifier - resolved through its own datatype
resolution, nested to any depth - or to an enclosing type parameter, emitted as that parameter's
name), and `unknown` where it is missing or unbound (`<eTypeArguments/>`). So `EJavaClass` with no
argument and with an empty argument both emit `TypeScriptClass<unknown>`; `EJavaClass<EString>`
emits `TypeScriptClass<string>`. Classes/enums bound inside type arguments are registered for
import too (`genericArgumentClassifiers`). This needed, in `@typemf/core` (hand-written subset;
your generated core has the full versions): `ETypeParameter`, `EGenericType`,
`EClassifier.eTypeParameters`, `ETypedElement.eGenericType` (kept in sync with `eType`:
`setEGenericType` sets `eType` to the generic type's classifier, `setEType` clears the generic
type), plus `instanceClassName` on `EClassifier`; the converter copies all of it.

**Import collector.** One request per (name, source); a name requested from several places is one
import if they resolve to the same module "however spelled" (extension not significant), decided at
render time when mode and importing folder are known. Real Ecore.ecore needs this: the `EEList`
datatype is annotated `EList` from `./types/EList` while the templates independently import the
foundational `EList` - one module when self-hosting, genuinely different sources (a reported
collision) in ordinary mode.

**Known limitations, deliberate:**

- Type-parameter bounds, `EOperation.eTypeParameters`, `EClass.eGenericSuperTypes`, wildcard bounds
  are not modeled.
- In the old (canonical) pipeline a type argument bound to `EObject` degrades to `unknown` (the
  loader drops the EObject classifier). In real Ecore.ecore this only occurs inside EObject's own
  operations, which are never generated; the xmi-based loader models EObject as a real classifier.
- The self-hosted `EcorePackageImpl`'s runtime description of itself (its bootstrap) still records
  only plain `eType`s, not generic types or type parameters - only the generated TEXT is generic-aware.
- `isPrimitiveValueType`/`primitiveDefaultValue`/`beanGetterName` still key on the names
  `EBoolean`/`EInt`/... (zero-defaults and `isX` getters, not type mapping) - not annotation-driven.

Verified against real Ecore.ecore (updated, with annotations), merged into the full workspace
structure with the hand-supplied `types/EEnumerator.ts` and a `types/TypeScriptClass.ts` added after
generation: strict `tsc --noEmit` reports **0 errors** (48 at the start of the import rewrite, 14
before this work).

## Operation bodies: two annotation layers (supersedes the per-template-set `body:typescript` key)

`operationBody()` (`typescript-filters.ts`) reads an operation's body in strict priority order:

1. the `body` detail of the annotation with source `https://typemf.dev/generator`
2. the `body` detail of the annotation with source `http://www.eclipse.org/emf/2002/GenModel`

Used as written, not checked; an empty value counts as absent (falls to the next layer, and finally
to the throwing stub - which now says the operation "has no `body` annotation"). The old key
`body:typescript` is no longer read, and there is no longer a per-template-set dimension: the earlier
reasoning (one shared `body` key is ambiguous across several target languages) is superseded by this
decision. Consequence worth knowing: layer 2 is real EMF's own key, whose value is **Java** in an
EMF-authored .ecore - it is emitted verbatim, so any operation whose GenModel body is not valid
TypeScript needs a layer-1 body to override it.

**Bug fixed on the way:** the old-pipeline converter deliberately did not copy annotations onto
operations, so a body written in a real .ecore file could never reach the generator - bodies only
worked in hand-built models. Operation annotations are now copied (not parameter annotations). The
new tests load a real .ecore file and were mutation-checked: 4 of 6 fail without the converter fix.

Real Ecore.ecore (as of the last version supplied) carries no `body` annotations at all, so its 17
operations still generate throwing stubs - including `EModelElement.getEAnnotation(source)` and
`EPackage.getEClassifier(name)`, which the metaclass-accessor overloads delegate to via `super` and
which therefore throw at runtime until those two get a `body`. Overloaded operations ignore bodies
entirely (unchanged: their stub says so).

## Operations still generating throwing stubs (work list)

State as of the last Ecore.ecore supplied. Each needs a `body` detail in an annotation with source
`https://typemf.dev/generator` (or `http://www.eclipse.org/emf/2002/GenModel`) on the operation in
Ecore.ecore; until then it throws when called. To refresh: regenerate and look for methods whose body
is `throw new Error('X.y() has no `body` annotation - nothing to generate.')`.

| Class                | Operation (generated signature)                                         |
| -------------------- | ----------------------------------------------------------------------- |
| `EClass`             | `getOverride(operation: EOperation): EOperation                         | undefined` |
| `EEnum`              | `getEEnumLiteralByLiteral(literal: string): EEnumLiteral                | undefined` |
| `EFactory`           | `create(eClass: EClass): EObject                                        | undefined` |
| `EFactory`           | `createFromString(eDataType: EDataType, literalValue: string): unknown` |
| `EFactory`           | `convertToString(eDataType: EDataType, instanceValue: unknown): string  | undefined` |
| `EOperation`         | `getOperationID(): number`                                              |
| `EOperation`         | `isOverrideOf(someOperation: EOperation): boolean`                      |
| `EStructuralFeature` | `getContainerClass(): TypeScriptClass<unknown>                          | undefined` |

8 stubs (15 before the last update: 7 of `EClass`, `EClassifier.isInstance`, `EEnum.getEEnumLiteralByLiteral`, 3 of `EFactory`, 2 of `EOperation`, `EStructuralFeature.getContainerClass`; now implemented: `EClass.getEOperation`, `EClass.getFeatureCount`, `EClass.getFeatureID`, `EClass.getOperationCount`, `EClass.getOperationID`, `EClass.isSuperTypeOf`, `EClassifier.isInstance`).

**Overloaded operations** are dispatched when they have bodies (see "Overload dispatch" at the end of this file); `EEnum.getEEnumLiteral` (no body on any overload) is the only overloaded stub left.

**Bodies that do not compile yet** (7 strict-`tsc` errors, all inside bodies - the generator emits a body verbatim and registers no imports for what it references):

- missing imports of names the bodies use: `isEClass` and `EStructuralFeatureImpl`/`EOperationImpl`/`EObjectImpl` (in `EClass`/`EClassifier` impls);
- `EClass.getOperationCount`: `this.getOperations()` does not exist (`getEOperations()`);
- `EClass.isSuperTypeOf`: `.filter(clazz => isEClass(clazz))` is not a type guard, so `clazz` stays `EClassifier | undefined` (needs `(c): c is EClass => isEClass(c)`).
  The import gap is a generator question (bodies have no way to declare imports); the rest are body fixes.

## Documentation: typemf annotation first, Ecore annotation as the fallback

An element's doc comment comes from its `documentation` detail, layered: the annotation with source
`https://typemf.dev/generator` first, the one with source `http://www.eclipse.org/emf/2002/Ecore` as
the fallback. Applies to everything that gets a doc comment: package (interface and impl),
classifiers, features, operations, enums. Used as written; an empty layer-1 value counts as absent
and falls through.

**Consequence, by decision:** real EMF keeps `documentation` in the _GenModel_ source
(`http://www.eclipse.org/emf/2002/GenModel`), and that source is no longer read for documentation at
all - documentation an EMF-authored .ecore carries there is silently ignored unless it is also
supplied under one of the two sources above. (An earlier version of this section read GenModel as
the fallback; corrected when the intended source turned out to be Ecore.)

The two layered readings share one rule, `layeredAnnotationDetail(element, key, fallbackSource)`
(`typescript-filters.ts`), but the fallback source is per thing read, not global:
`documentation` -> `.../2002/Ecore`, `body` -> `.../2002/GenModel` (see the operation-bodies section).
Datatype `typescript-type` is not part of it: its fallbacks are instanceClassName, then the name.

**Layout fix.** `docComment()` no longer ends with a newline. Every template writes
`{{ docComment(x) }}` on its own line with the declaration on the next, so the template's newline is
the separator; the extra one used to leave a blank line between every doc comment and the declaration
it documents. Undocumented members are unchanged (`''` plus the template newline still gives the
same blank line before them), so only documented declarations move.

Verified: unit tests per rule; a real .ecore file on disk with documentation on a class (both
sources), features (fallback / empty-falls-back / none / GenModel-only-ignored), an operation, a
multi-line enum and the package, asserting the comment sits IMMEDIATELY above its declaration.
Mutation-checked both ways: restoring the trailing newline fails 11 tests, reverting the fallback to
GenModel fails 9. Regenerating the real Ecore.ecore is byte-identical to the previous output (it
contains no documentation yet).

## Import information: new annotation, internal vs external, and the mapping seam

> **Partly superseded** by "Type text and imports are two annotations; body imports" (end of this file): `type` in the `/import` annotation is now only the SYMBOL to import; the TEXT comes from the plain generator annotation. The internal/external rule, the mapping seam and the collector notes below still hold.

(Supersedes layer 1 of "EDataType type text" above. `typescript-type` / `typescript-import-from` under
`https://typemf.dev/generator` are no longer read.)

```xml
<eAnnotations source="https://typemf.dev/generator/import">
  <details key="type" value="EList"/>                <!-- the text to emit, and the symbol to import -->
  <details key="from" value="@typemf/core"/>         <!-- module OTHER packages import it from -->
  <details key="internal-from" value="./types/EList"/> <!-- where THIS generation imports it from, root-relative -->
</eAnnotations>
```

**The check, made during generation, per use** (`generation-context.ts`, `isExternal`): a type is
EXTERNAL when its package is not the one being generated; INTERNAL otherwise (also when there is no
generation in progress or the type has no package). Internal -> `internal-from`, falling back to
`from` (a datatype wrapping a third-party library needs only `from`). External -> `from` only: a
path relative to a foreign package root means nothing, so an external type with only `internal-from`
registers no import (the text is still emitted, so the gap shows up as a compile error naming the
type). No `type` -> the annotation says nothing and is ignored. Values are used as written, nothing
is checked. Interpretation to confirm: the internal -> `from` fallback.

**Why this fixes the EList collision:** an external `EEList` (`from` = `@typemf/core`) and the
templates' own foundational `EList` are the same source in ordinary mode, and an explicit
`@typemf/core` is merged into the one core import statement; internally (`internal-from`) they are the
same file. No more collision in either mode.

**Compatibility with the planned config/mapping step - the seam.** All lookups go through one object,
`TypeImportMapping` (`type-import-mapping.ts`): explicit entries first, then the type's own
annotation. Entries are keyed `<package nsURI>#<classifier name>`
(e.g. `http://www.eclipse.org/emf/2002/Ecore#EEList`), use the annotation's own key names, and are
supplied through the generation option `type-imports` (the generator config's existing `options`
object already flows there) - or `mapping.set(...)`. An explicit entry replaces the annotation
entirely (no field-by-field merge). So the config work only has to pre-populate this mapping from
"ecore package -> TypeScript module"; the resolution code does not change.

Plumbing: `TemplateSet.configureEnvironment(env, { pkg, options })` now receives the package being
generated and the options; the typescript set starts the generation context from it (one shared
instance, like the import collector, reset per `generate()`).

**Scope / limits:** the annotation is read on EDataTypes only. External _classes_ (a class extending
one from another package) need import locations too - not done. And nothing loaded from disk can be
external yet: the loader still rejects references into other files, so the external branch is
exercised by hand-built two-package models only. `generate-ecore` and the foundational names are
untouched.

Verified: unit + end-to-end tests (external vs internal, both fallbacks, the mapping seam, the EList
merge, no state leaking between generations); 7 mutations each caught (breaking the internal/external
check either way, ignoring `internal-from`, dropping the fallback, letting the annotation beat the
mapping, un-merging `@typemf/core`, still reading the old keys). Real Ecore.ecore, migrated
mechanically (`typescript-type`->`type`, `typescript-import-from`->`internal-from`, source renamed):
identical output to the previous delivery except the 36 annotation lines the bootstrap re-emits.

## Type text and imports are two annotations; body imports

A datatype is now described by TWO annotations:

```xml
<eAnnotations source="https://typemf.dev/generator">          <!-- the TEXT emitted in code -->
  <details key="type" value="EEnumerator"/>
</eAnnotations>
<eAnnotations source="https://typemf.dev/generator/import">   <!-- what to IMPORT, and from where -->
  <details key="type" value="EEnumerator"/>                    <!-- the symbol -->
  <details key="from" value="@typemf/core"/>                   <!-- external use -->
  <details key="internal-from" value="./types/EEnumerator"/>   <!-- internal use, root-relative; falls back to from -->
</eAnnotations>
```

They are independent, so the text may be compound (`number | undefined`, `number []`) while the symbol
imported is a plain name. Text layers: the generator annotation's `type`, then `instanceClassName`, then
the name. The import applies whenever the datatype is emitted and its import information (mapping entry,
else annotation) yields a source for the internal/external case at hand - regardless of which layer
supplied the text. An import annotation alone therefore does NOT supply the text. The mapping seam
(`type-imports` option) supplies IMPORT information only; the text always comes from the model.

**Body imports (`registerBodyImports`).** The same import annotation on an OPERATION declares what its body
needs; an operation needing several imports carries one annotation per import (all are read, in order).
They are registered in the impl file that emits the body - only when there is a body (the throwing stub
imports nothing) - and never in the interface. A body only belongs to the package being generated, so
`internal-from` applies, falling back to `from`. Two bodies wanting the same symbol from different
modules is a reported collision; from the same module (spelled any way) it is one import. Values are
used as written; not checked. The old `use-type-name` detail is not read (it was never specified; with
the import annotation it is redundant).

Verified: unit tests, end-to-end tests loading real .ecore files (bodies asserted intact, real
compile), 6 mutations each caught. Real Ecore.ecore: 11 -> 6 strict `tsc` errors.

### Errors left in Ecore.ecore itself (all 6 are in the file, not the generator)

- `EClassifier.isInstance`: its import annotation has `type="EObjectImple"` (typo) - imports a
  non-existent symbol AND leaves `EObjectImpl` (used by the body) undeclared: 2 errors.
- `EClass.isSuperTypeOf`: the body uses `isEClass` and has no import annotation (1 error); and
  `.filter(clazz => isEClass(clazz))` is not a type guard, so `clazz` stays `EClassifier | undefined`
  (2 errors) - needs `(c): c is EClass => isEClass(c)`.
- `EClass.getOperationCount`: `this.getOperations()` does not exist - `getEOperations()` (1 error).
- The file as uploaded was not well-formed XML (a bare `<eAnnotations>` at line 525 where
  `</eAnnotations>` belongs, and `</eAnnotations` without `>` at line 631); test runs used a repaired copy.

## Overload dispatch

An overloaded operation (2+ operations with the same name in a class) used to always be a single
throwing stub and ignore every body. Now:

- **Signatures.** Every overload signature is emitted, then ONE implementation signature
  (`mergedParamList`): one parameter per position up to the LONGEST overload, each typed as the union
  of the overloads' types there (among those that have the position), named via `mergeNames`
  (`featureID`/`featureName` -> `featureIDOrFeatureName`), and OPTIONAL when not every overload has
  that position. Different arities used to generate an implementation signature taking only the first
  overload's parameters - code that did not compile; that was a latent bug, not a supported limit.
- **Dispatch (`overloadDispatch`).** The implementation is `if (<condition>) { <that overload's body> }`
  per overload, in declaration order, then `throw ... no overload matches`. Per overload, the
  condition is an explicit `dispatch` detail on its `https://typemf.dev/generator` annotation, used as
  written (over the MERGED parameter names) - else derived, `&&`-combined per position: a position the
  overload lacks must be `=== undefined`; where the overloads having the position differ in type, the
  overload's own type must be a runtime-testable TS primitive (`typeof x === 'string' | 'number' |
'boolean' | 'bigint'`); where the type is the same everywhere but the position is optional,
  `!== undefined`. That is TypeScript knowledge, not a mapping of Ecore datatypes.
- **Aliases.** Inside a branch, each of the overload's OWN parameter names whose body actually uses it
  (string literals and comments ignored; `${...}` in a template literal counts) is declared as
  `const featureID = featureIDOrFeatureName as number;`, so a body may use either name. Never emitted
  unused (`noUnusedLocals`), never when the own name is the merged name.
- **Per branch.** Bodies and body imports (`registerBodyImports`) are per overload. An overload without
  a body still gets its branch, which throws its own "no `body` annotation" error.
- **Not dispatched -> a single throwing stub, whose message says why:** no overload has a body; a
  needed test cannot be derived (a generated interface, a many-valued or compound type) and there is
  no `dispatch` detail; or two overloads end up with the same condition (the second would be
  unreachable).
- **Limits.** Presence is `=== undefined`, so an explicitly passed `undefined` reads as absent.
  Overloads of generated interface types need a `dispatch` detail (interfaces have no `instanceof`, and
  the reflective type guards depend on `isSuperTypeOf`). The metaclass-accessor collision overloads
  (`getEAnnotation(): EClass` / `getEAnnotation(source)`) are a separate, template-built mechanism.

Verified: unit tests for every rule, and end to end from a real .ecore file that type-checks under
`strict` + `noUnusedLocals` AND is executed (each call reaches the overload its arguments select; an
overload without a body and a call matching none both throw the right error); 9 mutations each caught
(the first pass missed one - body imports of dispatched branches had no test, since added). Real
Ecore.ecore: your two `getEStructuralFeature` bodies now run; still exactly the 6 errors that are in
the file itself (see above). Observed, NOT fixed: the generated package impl imports `EEnumImpl` even
when the metamodel has no enum (an unused import under `noUnusedLocals`).

## Status after the upload that fixed the XML: what is still missing (verified by running, not only type-checking)

Type-check (strict, merged into the workspace layout): 1 error. Runtime smoke test of the self-hosted
generated package (bootstraps: 52 classifiers; `getEStructuralFeature` dispatch by name AND by ID works):

1. **Compile error (1):** the `isEClass` body import uses `from` with `../util/EcoreTypeGuards.js`. `from`
   is a module specifier, and relative paths are relative to the generated ROOT, so a body import
   resolves to `../../util/...` from `impl/`. Use `internal-from` = `./util/EcoreTypeGuards.js`
   (verified: with the path corrected, 0 errors - TS 5.9 infers the `.filter` type predicate itself, so
   the earlier "needs an explicit type guard" advice was wrong).
2. **`EClass.isSuperTypeOf` recurses forever (RangeError).** `someClass.getESuperTypes().find(clazz =>
clazz.isSuperTypeOf(someClass))` asks the SAME question of a supertype with the same argument. It must
   ask `this.isSuperTypeOf(clazz)`. Every reflective type guard calls it.
3. **`EClass.getFeatureCount` counts own features only** (16; 24 with inherited) - the body uses
   `getEStructuralFeatures()`; it needs the ALL-features list, which is unimplemented (see 4).
4. **Derived features are not implemented (biggest gap).** 18 in the file (eAllSuperTypes,
   eAllStructuralFeatures, eAllAttributes, eAllReferences, eAllContainments, eAllOperations,
   eAllGenericSuperTypes, eAttributes, eReferences, eIDAttribute, eAttributeType, eReferenceType, eRawType,
   defaultValue, instanceClass, container, many, required). They are generated as plain stored fields
   nothing computes (`getEAllStructuralFeatures()` -> 0 at runtime). Four (`many`, `required`, `container`,
   `eReferenceType`) are special-cased by `TRIVIAL_DERIVED_FORMULAS` in `typescript-filters.ts`: a table of
   formulas keyed by feature NAME - the same kind of hard-coded mapping removed for datatypes. The other 14
   have no mechanism at all: only OPERATIONS can carry a body. Proposal: a layered `get` detail on a
   feature (typemf generator annotation, then GenModel - `get` is EMF's own key for a getter body), body
   imports via the import annotation exactly as for operations, and the four formulas moved into
   Ecore.ecore, deleting the table.
5. **The bootstrap builds no operations**, so at runtime `EClass.getEOperations()` is empty
   (`getOperationCount()` -> 0 although EClass declares 7). `getOverride`, `getOperationID`,
   `isOverrideOf`, `getEOperation` cannot work without a runtime representation. Likewise no generic types
   or type parameters at runtime.
6. **Remaining stubs (8) + 1 overload:** EClass.getOverride; EEnum.getEEnumLiteralByLiteral (trivial);
   EEnum.getEEnumLiteral (overloaded, no bodies - dispatch will handle it once both have bodies);
   EFactory.create/createFromString/convertToString (string<->value conversion has no model-level source
   now that datatype mappings are annotations); EOperation.getOperationID/isOverrideOf (need 5);
   EStructuralFeature.getContainerClass (needs derived `instanceClass`, see 4).
7. **By design:** EObject has no generated file (52 classifiers vs 53 in the file); its operations come
   from the hand-written core.
8. **Generator-side, still open:** references into other files are rejected by the loader; external
   classes have no import location; the old-pipeline removal is only in the working copy of the upload;
   workspace sync on hold; unused `EEnumImpl` import in the package impl of enum-less metamodels.

## Checking new Ecore.ecore uploads (standing task)

Each upload is judged against the same checklist by `tools/check-ecore/check_ecore.py <file>` (regenerates
with the real CLI, type-checks merged into the user's workspace layout from `workspace.zip`, then runs
`runtime-checks.test.ts` against an ORACLE computed from the .ecore XML itself: feature/operation/supertype
counts). Checklist: (1) XML well-formed; (2) generation succeeds; (3) strict `tsc`: 0 errors; (4)
`isSuperTypeOf` terminates and is right (reflexive, direct, transitive, negative, reverse); (5)
`getFeatureCount` = own + inherited; (6) `getOperationCount` = own + inherited, and operations exist at
runtime; (7) the 18 derived features compute (eAll*, eAttributes, eReferences, eIDAttribute, many, required,
container, eReferenceType, eAttributeType, ...); (8) stubs remaining; (9) overload dispatch works; static:
no `<details>` without `key`, no leftover `use-type-name`, body imports use `internal-from`.

Note for maintaining the checker: a merge step once wrote `open(p,'w').write(open(p).read()...)`, which
truncates before reading and wiped four hand-written core files (375 bogus errors) - read first, then write.

### Result for the upload that changed the `isEClass` path, `getFeatureCount` and `getOperationCount` bodies

12 passed, 18 failed. `tsc` 0 errors (aspect 3 fixed). `isSuperTypeOf` unchanged - still infinite recursion.
`getFeatureCount`/`getOperationCount` bodies are now semantically right but return 0: they depend on the
unimplemented derived features (eAllStructuralFeatures, eAllOperations) and on operations existing at runtime.
Only the four formula-table derived features pass; eAll*/eAttributes/eReferences/eAttributeType fail.

## `EClass.isSuperTypeOf` rewritten; multi-line bodies are indented

The sketched body (Java-style port of `someClass == this || someClass.getEAllSuperTypes().contains(this)`)
asked `clazz.isSuperTypeOf(someClass)` of the same supertype with the same argument - infinite recursion.
Replaced by an iterative walk up from `someClass` over `getESuperTypes()` and the raw classifiers of
`getEGenericSuperTypes()` with a `Set` of visited classes (cycle-safe, no stack growth): `true` as soon as
`this` is reached. Checked with `tools/check-ecore`: all five `isSuperTypeOf` runtime checks pass (reflexive,
direct, transitive, negative, reverse), strict `tsc` 0 errors. Once the derived `eAllSuperTypes` is computed
the whole body could become `someClass === this || someClass.getEAllSuperTypes().contains(this)`.

Template: a body is emitted with `| indent(4)` (`| indent(6)` inside an overload branch), so a multi-line
body (newlines as `&#10;` in the XML attribute) keeps its relative indentation inside the method instead
of dropping to column 0. Tested at both sites and mutation-checked.

Observed, not changed: `EClassifier.isInstance` is `object instanceof EObjectImpl` - valid TypeScript, but
it is true for any EObject whatever its class, so it does not test the classifier at all.

## `EClass.getEAllStructuralFeatures` (derived): sketch fixed, generator support still missing

The Java-style sketch could not compile as TypeScript: uninitialised `const x = ;`; `instanceof EClass` on an
interface (no runtime value - use `isEClass()`); `current in visited` (`in` tests property names, not Set
membership - `.has()`); `values().next` (a call, and `.value`); `Set.remove/addAll` (`delete` / a loop);
`Set<EClassifier>.addAll(getEGenericSuperTypes())` added `EGenericType` objects (needs `.getEClassifier()`);
`!= 0`; and it returned a `Set` where the feature's type is `EList<EStructuralFeature>`. Its visit order
(own first) is also not EMF's: `eAllStructuralFeatures` lists every supertype's features first, then the
class's own. Fixed body: recursive `visit(eClass)` with a visited `Set` (cycle-safe) - supertypes, then raw
classifiers of generic supertypes, then own features - returning
`new BasicEList<EStructuralFeature>(undefined, undefined, features)`.

Tried out with `check_ecore.py <file> --patch <json>` (a patch on the GENERATED class, since the generator
cannot emit a derived-feature body yet): strict `tsc` 0 errors; `getFeatureCount` 24/24; order equals the
oracle computed independently from the XML (eAnnotations, name, instanceClassName, ...); a cyclic hierarchy
terminates with each feature once.

Still missing for real use: (1) a `get` body for structural features; (2) the generated reflective
`eGet`/`eIsSet` read the STORED field for a derived feature (`case 18: return this._eAllStructuralFeatures`),
bypassing the getter - checked by `derived.eAllStructuralFeatures.eGet`, which fails even with the fixed
getter; (3) caching/invalidation (the fixed getter recomputes on every call, correct but not cached).

## Both fixed functions integrated into Ecore.ecore (model only - `get` not yet read by the generator)

`isSuperTypeOf`'s `body` detail is now the fixed iterative version (see the earlier "isSuperTypeOf
rewritten" note); its `isEClass` import annotation was also cleaned up: moved from `from` to
`internal-from`, since `util/EcoreTypeGuards.js` is a self-hosting-only generated file with no
`@typemf/core` counterpart to fall back to externally.

`eAllStructuralFeatures` (the EReference feature, not an operation) got a NEW `get` detail on its
`https://typemf.dev/generator` annotation, carrying the fixed traversal, plus two
`https://typemf.dev/generator/import` annotations (`isEClass` internal-from
`./util/EcoreTypeGuards.js`; `BasicEList` from `@typemf/core` / internal-from `./impl/BasicEList.js`).
This is DATA ONLY: no template reads a `get` detail yet, so `getEAllStructuralFeatures()` and
everything depending on it (`getFeatureCount`, `eAllAttributes`, `eAllReferences`, ...) are UNCHANGED

- still the stored-field stub, still 0 at runtime. Confirmed with `check_ecore.py`: same 16 failures as
  the baseline upload, `isSuperTypeOf`'s 5 checks still pass, `tsc` still 0 errors (the unread annotation
  does not disturb generation).

## `get`/`set` for EStructuralFeature: `https://typemf.dev/generator/feature`

```xml
<eAnnotations source="https://typemf.dev/generator/feature">
  <details key="get" value="..."/>   <!-- overrides the getter; NO stored field is declared -->
  <details key="set" value="..."/>   <!-- overrides the setter; optional, only meaningful single-valued -->
</eAnnotations>
```

Single source, no GenModel fallback (matching the `dispatch` precedent - not requested here). `get` and
`set` MUST share ONE annotation object (getEAnnotation(source) returns only the first match, exactly
like body/dispatch/documentation) - two separate `<eAnnotations>` elements with the same source silently
lose the second detail; found this the hard way in my own first draft of the tests.

**Getter (`featureGetter`).** No field/cache declared for that feature (single or many-valued) - the
value is computed, not stored. The bean getter's body is the annotation's `get`, used verbatim (with
`registerBodyImports`, which now also accepts a feature, not just an operation). `eGet` delegates to the
real getter instead of reading a field - and, since I was already touching that exact switch, the SAME
fix now also applies to the four PRE-EXISTING `trivialDerivedFormula` features (`many`, `required`,
`container`, `eReferenceType`): they had the identical bug (getter computed one thing, `eGet` read an
unused, always-default field) - confirmed by a dedicated test using that exact shape.

**Setter (`featureSetter`).** Replaces the default `this.eSet(...)` delegation in the bean setter; `eSet`
itself delegates to the real setter reflectively, the same way `eGet` now does. A feature with `get` and
no `set` is read-only (`isReadOnlyFeature`): no setter is declared in the interface, and `eSet` has no
case for it (falls to super/throw) - same treatment `trivialDerivedFormula` features already had, now
unified under one function. `set` on a many-valued feature is a no-op (many-valued features never get a
setter at all, `get`-annotated or not) - flagged by `findFeatureAnnotationProblems`, wired into `validate()`.

**eIsSet/eUnset/eBasicSetValue/eBootstrapList**, for a `get`-annotated feature: `eIsSet` calls the getter
and applies the same not-default/not-empty test the field-backed shape uses; the other three have no case
at all (nothing to unset, bootstrap-write, or hand back - falls to super/throw). Unchanged for
`trivialDerivedFormula` features (kept minimal - only the `eGet` fix was extended to them).

**Confirmed by design (not a gap): a body is always internal.** `registerBodyImports` resolves through
`internal-from`, falling back to `from` - with no internal/external mode switch, and none is wanted: a
body is source code that becomes part of the package being generated, in every generation, never a
reference to something belonging to a DIFFERENT package (unlike a datatype, which genuinely can). `from`
on a body import is only an alternate spelling of the same (internal) path, not a distinct external case

- contrast `resolveDataTypeTs`, where `from`/`internal-from` really do mean external/internal.

One consequence worth knowing, not a bug: a body wanting `BasicEList` specifically collides with the
template's own unconditional foundational import of it if that generation is ORDINARY (not self-hosting)

- both resolve to the same NAME from different modules there. This isn't a case the mechanism needs to
  paper over: constructing a fresh `EList` from scratch inside a body is a self-hosting-only need in
  practice (`getEAllStructuralFeatures` and its kin), and self-hosting (`generate-ecore: true`) is exactly
  where the two resolve to the identical relative specifier and merge cleanly (confirmed).

Verified: 12 new tests (annotation reading, validation, generated shape for get-only/get+set/many-valued,
the formula-delegation fix, a real self-hosting-mode compile+execute); 6 mutations each caught. Real
Ecore.ecore, with the eAllStructuralFeatures `get` migrated from the old ad-hoc `.../generator` source to
the new `.../generator/feature` one: `getEAllStructuralFeatures()` now genuinely computes at runtime (24
features, correct EMF order, cycle-safe), `getFeatureCount()` now correctly returns 24, and the
`eGet`/getter agreement bug is fixed (`eGet` used to silently return 0 against a getter returning 24).

## `get` bodies for the remaining `eAll*` derived features

Added `get` (source `https://typemf.dev/generator/feature`) to `eAllAttributes`, `eAllReferences`,
`eAllContainments`, `eAllOperations`, `eAllSuperTypes`, `eAllGenericSuperTypes` - all six `eAll*`
features on `EClass` other than `eAllStructuralFeatures` (already done). Same style throughout: a
`visited: Set<EClass>` guard against cycles, `Set`-based collection (redundant with `BasicEList.add()`'s
own uniqueness check - confirmed by reading its source - kept for consistency with the earlier body, not
because it's load-bearing on its own).

- `eAllAttributes`/`eAllReferences`/`eAllContainments`: built on top of the already-verified
  `getEAllStructuralFeatures()`, filtered by `isEAttribute`/`isEReference` (and `.isContainment()`) -
  no new traversal, automatically inherits its correctness and order. `.filter(typeGuard)` on this
  `EList` doesn't narrow the array's type (no type-predicate overload on `filter`), so each needs an
  explicit `as EAttribute[]`/`as EReference[]` cast - found via a real `tsc` failure, not assumed.
- `eAllOperations`: own traversal (own class's operations don't live inside `eAllStructuralFeatures`).
- `eAllSuperTypes`: own traversal, excluding `this` (the visit function adds each node's supertypes to
  the result, never the node passed to visit()).
- `eAllGenericSuperTypes`: same shape, but the EGenericType view of each edge - a genuinely generic edge
  (from `getEGenericSuperTypes()`) reuses the real `EGenericType` object; a plain edge (from
  `getESuperTypes()`) gets an implicit, argument-less `EGenericTypeImpl` synthesized for it (real EMF's
  own convention). Needs `EGenericTypeImpl` as a body import (`from`/`internal-from`, matching
  `EObjectImpl`/`EStructuralFeatureImpl`/`EOperationImpl`'s precedent).

**`eGenericSuperTypes` added to `@typemf/core`'s `EClass`** (interface, impl field/getter, reflective
eGet/eSet/eIsSet/eUnset) - needed to even construct a genuine generic-supertype edge for testing; my
core never had it (only `EStructuralFeature`/`EClassifier`'s type-PARAMETER support was added earlier,
for a different feature). Mirrors `eSuperTypes` exactly. Separate from the framework's own hand-written
`getEAllSuperTypes()` etc. (used internally for loaded models generally) - this is purely the missing
piece needed to model a direct generic-supertype edge at all.

**Verification, and what it does and doesn't cover:**

- Real Ecore.ecore, merged into the user's workspace layout: strict `tsc` 0 errors; `eAllAttributes`
  (7), `eAllReferences` (17), `eAllContainments` (5), `eAllSuperTypes` (3), `eAllStructuralFeatures` (24)
  all match an oracle computed independently from the XML. 25/33 checks pass, up from 21.
- `eAllOperations` (and, by extension, anything depending on operations existing at runtime) still
  returns 0 against real Ecore.ecore - NOT a flaw in this body: the self-hosting bootstrap builds no
  `EOperation` objects at all (a separate, already-disclosed, pre-existing limitation). Its LOGIC is
  independently verified against a genuinely self-referential toy metamodel (a hand-built "MetaClass has
  superTypes: MetaClass[] and operations: MetaOperation[]" hierarchy, the same self-referential shape
  `EClass` itself has - an ordinary domain class hierarchy's `this` is never self-typed the way `EClass`'s
  `this` is, so that was tried FIRST and does not work at all, confirmed by a real `tsc` failure): three
  levels, correct own+inherited order, a genuine diamond (two distinct paths converging - not just the
  same edge added twice, which is a degenerate case BasicEList's own uniqueness check already absorbs on
  its own), and a genuine cycle (mutation-confirmed: removing the `visited` guard hangs/overflows the
  stack on the cyclic case specifically, not on the diamond one - the guard's real job is cycle safety,
  not dedup, which happens one layer down).
- `eAllGenericSuperTypes` is NOT independently execution-tested against a real generic edge (real
  Ecore.ecore has none at all to exercise; building a second self-referential toy metamodel for this
  specific case was judged disproportionate given its structural identity to the tested `eAllSuperTypes`
  traversal - the only difference is which value is collected at each step). Disclosed, not hidden.
- `eAttributes`/`eReferences` (the OWN, not "All", views) were explicitly out of scope for this request
  and remain unimplemented; still fail, as before.

## Continuing: `eAttributeType`, `eAttributes`, `eReferences` (the "own" views)

- **`eAttributeType`** (on `EAttribute`, single-valued): fits the exact shape already established for
  `eReferenceType` - added as a fifth entry to `TRIVIAL_DERIVED_FORMULAS` (`(this.getEType() as EDataType |
undefined)`), a GENERATOR code change, not a model one. New unit tests cover the table directly (all
  five entries, that it only applies to a feature actually marked `derived`, that an unrelated name
  returns `undefined`) - the table had no dedicated test before this. Mutation-confirmed: a wrong cast
  type is caught.
- **`eAttributes`/`eReferences`** (on `EClass`, many-valued - the OWN views, not `eAllAttributes`/
  `eAllReferences`): same `get`-annotation mechanism, filtering `this.getEStructuralFeatures()` (not
  `getEAllStructuralFeatures()`) by `isEAttribute`/`isEReference`. Structurally identical to
  `eAllAttributes`/`eAllReferences` (same cast-after-filter pattern, same imports), so no new test
  infrastructure was needed - only the real-file verification.

Verified against real Ecore.ecore, merged into the user's workspace layout: strict `tsc` 0 errors;
`eAttributes` (2), `eReferences` (14), `eAttributeType` (now agrees with `eType`) all match. 28/33 checks
pass, up from 25. The remaining 5 are all downstream of the single pre-existing gap (operations don't
exist at runtime) or explicitly out of scope (the 9 stub operations).

**Every derived feature on `EClass`/`EAttribute`/`EReference` that check_ecore.py tracks now passes, EXCEPT
those blocked on operations existing at runtime.** Remaining, in `TRIVIAL_DERIVED_FORMULAS` or `get`-bodied:
`many`, `required`, `container`, `eReferenceType`, `eAttributeType`, `eIDAttribute` (formula/pre-existing),
`eAllStructuralFeatures`, `eAllAttributes`, `eAllReferences`, `eAllContainments`, `eAllSuperTypes`,
`eAllGenericSuperTypes`, `eAttributes`, `eReferences` (`get`-bodied, this session). Not yet done: `eAllOperations`
(logic verified independently, blocked on the runtime gap), `eRawType` (not investigated this session).

## `EFactory.create()`'s fallback: `super.create(eClass)` instead of a locally-thrown error

Clarified from a misunderstanding: `{Pkg}FactoryImpl.create()` (e.g. `EcoreFactoryImpl.create()`) was
ALREADY auto-generated by `efactory.njk`, via a `classifierID` switch, and ALREADY WORKED (confirmed by
running it against all 14 concrete classifiers in the self-hosted metamodel before touching anything -
0 mismatches). The still-stubbed "EFactory.create" in the stub list was a SEPARATE method:
`EFactoryImpl.create()`, generated from the ordinary `create` OPERATION declared on the `EFactory`
classifier itself (real EMF's own reflective `EFactory.create`) - effectively dead code for normal use,
since every concrete `{Pkg}FactoryImpl` always overrides it.

Three changes, matching the design once clarified:

1. **`@typemf/core`'s `EFactoryImpl.create()`** is no longer `abstract` - it now has a concrete, terminal
   implementation throwing `Cannot create an instance of classifier id ${id}: unrecognized by this
factory or any in its super chain.` (mirroring `createFromString`/`convertToString`'s existing
   concrete-default pattern in the same class). `DynamicEFactoryImpl` is unaffected - it already overrides
   `create()` fully. The class itself is no longer `abstract class` either, since nothing else on it was.
2. **`efactory.njk`**'s generated `default:` case now `return super.create(eClass);` instead of throwing
   locally - so the "unknown classifier" error is thrown exactly once, in one place, not duplicated per
   generated package.
3. **Ecore.ecore**: the `create` operation on the `EFactory` classifier gets a `body` (source
   `https://typemf.dev/generator`) with the SAME throwing behavior - the self-hosted `EFactoryImpl` (which,
   when self-hosting, IS this same generation's own `impl/EFactoryImpl.ts`) is what `EcoreFactoryImpl`'s
   `super.create()` actually reaches.

**A real bug found along the way, not assumed:** the `create` operation had no `lowerBound`, defaulting
to optional - the self-hosted `EFactoryImpl.create()`'s generated signature became
`(eClass: EClass): EObject | undefined`, while `efactory.njk`'s hardcoded `{Pkg}FactoryImpl.create()`
signature is non-optional `EObject` - a genuine `tsc` type error (`EObject | undefined` not assignable to
`EObject`) once `super.create()` was introduced, caught by the real strict-mode check, not predicted in
advance. Fixed by adding `lowerBound="1"` to the operation, matching real EMF's own declaration.

Verified: `@typemf/core` tests (the base throw, a subclass partially overriding `create()` and delegating
via `super.create()` - the exact shape `efactory.njk` now generates - and that `DynamicEFactoryImpl`
still never reaches the base); a generator test (generated code contains `super.create(eClass)`, not the
old local throw; type-checks; and ACTUALLY RUNS - a recognized classifier still creates correctly, an
unrecognized one throws from the base, naming its id); mutation-confirmed (reverting the template to a
local throw fails 2 of 3 new tests). Real Ecore.ecore, merged into the user's workspace layout: strict
`tsc` 0 errors, `EcoreFactoryImpl.create()` still creates every concrete classifier correctly (unaffected,
confirmed by execution), AND an unrecognized classifier is confirmed, by execution, to fall through to
the self-hosted `EFactoryImpl.create()` body and throw from there. Stub count: 8, down from 9.

## `EFactoryImpl.create()`'s terminal fallback: warn and return a `DynamicEObjectImpl`, not throw

Changed the terminal end of the `create()` delegation chain (see the previous section) from throwing to
a graceful degrade: `console.warn(...)` naming the classifier, then `return new DynamicEObjectImpl(eClass);`

- a REAL, working instance, reflectively backed by `eClass`, not a placeholder. `DynamicEObjectImpl` was
  already used exactly this way by `DynamicEFactoryImpl`, so there was no circularity to introduce.

Kept `DynamicEFactoryImpl`'s existing abstract/interface guard, applied here too: creating ANY instance of
an abstract or interface `EClass` is invalid regardless of which factory ends up doing it, dynamic or
generated, so that case still throws - a dynamic instance wouldn't fix what's actually wrong. Confirmed
against the real self-hosted metamodel using `EModelElement` (genuinely abstract in real Ecore.ecore), not
a synthetic case.

Three places updated to match: `@typemf/core`'s `EFactoryImpl.create()` (the change itself); the `EFactory
.create` `body` in Ecore.ecore, which is what the self-hosted `EFactoryImpl.create()` actually runs when
self-hosting (needs its own `DynamicEObjectImpl` import annotation - `from`/`internal-from`, same
convention as `EObjectImpl`/`EStructuralFeatureImpl` etc.); `efactory.njk` needed NO change at all - its
`return super.create(eClass);` (from the previous section) already delegates to whatever the base
considers "unrecognized", so it automatically inherits this new behavior.

Verified: `@typemf/core` tests (warns exactly once with a message naming the classifier id/name; still
throws for abstract/interface, with NO warning logged in that case; the delegation-chain shape efactory.njk
generates); a generator test, rewritten from the old throw-expectation to actually construct a real,
unregistered `EClassImpl` and confirm a genuine `DynamicEObjectImpl` comes back (`instance.eClass() ===
theClassifier`), not just a text/mock check; mutation-confirmed (removing the abstract/interface guard,
changing `console.warn` to `console.debug`, or returning `undefined` instead of the real instance - all
three caught, the first only after I found and fixed a pattern-mismatch in my own mutation script that
silently made it report a false pass). Real Ecore.ecore, merged into the user's workspace layout: strict
`tsc` still 0 errors; execution-confirmed with the ACTUAL self-hosted `impl/EFactoryImpl.ts` - an
unrecognized classifier now returns a working `DynamicEObjectImpl` with exactly one warning logged, and a
genuinely abstract real classifier (`EModelElement`) still throws. Stub count unchanged at 8 (this only
changed EXISTING, already-unstubbed behavior).

## CORE REPLACEMENT PLAN — tracker (standing, update as we go)

Goal: replace the hand-rolled classes in `packages/core/src/metamodel` with the generated self-hosted
output. Ordered by actual dependency, not by how the issues were first found. Status legend: TODO / IN
PROGRESS / DONE / DEFERRED (explicitly out of scope for this swap).

| #   | Point                                          | Status         | Notes                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0   | `use-type-name` cleanup                        | **DONE**       | Removed from Ecore.ecore. Was already inert (redundant with the import annotation); this only removes noise.                                                                                                                                                                                                 |
| 1   | Caching for `get`-bodied derived features      | **DONE**       | See the dedicated write-up below - two real bugs found and fixed along the way, not just a straightforward implementation of the approved design.                                                                                                                                                            |
| 2   | 4 of 5 independent stub bodies                 | **DONE (4/5)** | `EStructuralFeature.getContainerClass` needed new infrastructure that doesn't exist yet, split out - see the write-up below and the new tracker line D3.                                                                                                                                                     |
| 3   | Operations exist at runtime                    | **DONE**       | See the dedicated write-up below.                                                                                                                                                                                                                                                                            |
| 4   | 3 operations-dependent stub bodies             | **DONE**       | See the dedicated write-up below.                                                                                                                                                                                                                                                                            | `EClass.getOverride`, `EOperation.getOperationID`, `EOperation.isOverrideOf` - need real `EOperation` objects to operate on.                                                                                                                                              |
| 5   | `eRawType`                                     | **DONE**       | See the dedicated write-up below.                                                                                                                                                                                                                                                                            | A derived feature not looked at yet this session. Likely the same shape as `eAttributeType`/`eReferenceType` or the `get`-bodied `eAll*` features - unconfirmed until investigated.                                                                                       |
| 6   | Loader pipeline dependency                     | **DONE**       | See the dedicated write-up below.                                                                                                                                                                                                                                                                            |
| 7   | The actual swap                                | **DONE**       | See the dedicated write-up below.                                                                                                                                                                                                                                                                            | Merge generated output into `packages/core/src/metamodel`; ensure `types/TypeScriptClass.ts` and `types/EEnumerator.ts` (hand-authored, never generated, by design) are in place; run the full EXISTING `packages/core` test suite against the swapped-in implementation. |
| D1  | `eAllGenericSuperTypes` real-edge verification | DEFERRED       | Logic verified against a hand-built toy model only - real Ecore.ecore has no generic supertype edges to exercise the "reuse the real object" branch against. Same code path as the tested `eAllSuperTypes`, so treated as covered by extension; revisit only if the model ever gains a genuine generic edge. |
| D3  | `EStructuralFeature.getContainerClass`         | **DONE**       | See the dedicated write-up below.                                                                                                                                                                                                                                                                            |
| D2  | Cross-package/external loading                 | DEFERRED       | The loader rejects references into other `.ecore` files; external classes have no import-location mechanism. Not needed for Ecore.ecore itself (one self-contained file) - explicitly out of scope for this swap.                                                                                            |

### Ordering rationale

Points 1-2 are independent, low-risk, and improve on what exists today (a real regression and a real gap)
without touching the bootstrap or the loader - done first for that reason, not because they're most
important. Point 3 is the one substantive unknown (scope not yet investigated) and gates point 4. Point 6
is placed right before the swap deliberately: nothing before it depends on the loader, and doing it too
early would mean re-doing it if points 1-5 change what the generated code looks like.

## POINT 1 DONE: caching for `get`-bodied derived features (option C, notification-driven)

**Design.** A single global counter, `EObjectImpl.getModelGeneration()` (`@typemf/core`), bumped on
every `eDidAdd`/`eDidRemove` call anywhere in the loaded model. Every generated `get`-bodied getter
(both many- and single-valued) caches its result alongside the generation it was computed at, and
recomputes only when the current generation has moved past that. Deliberately GLOBAL rather than
scoped to the specific object that changed: correctly identifying just the affected caches would need
either tracking each cache's real dependencies, or a reverse (subtypes) graph for the structural case -
this project has neither. A global bump invalidates more than strictly necessary on every edit, but
never leaves anything stale, and still serves the actual motivating pattern (edits cluster at
construction/load time, reads cluster at serialization time, the two rarely interleave).

**Two real bugs found by testing, not predicted in advance:**

1. The first version scoped the bump to four feature names only (`eStructuralFeatures`, `eOperations`,
   `eSuperTypes`, `eGenericSuperTypes` - the metamodel-structural ones the motivating `eAll*` bodies
   depend on). A real execution test caught this as wrong: a `get` body is free to read ANY feature, not
   only structural ones (the existing `label`/`raw2` test case - a custom getter reading an ordinary
   attribute - went stale after that attribute's own setter ran, since `raw2` isn't one of the four
   names). Fixed by broadening to bump on every `eDidAdd`/`eDidRemove`, unconditionally - the only scope
   correct for an arbitrary `get` body. Renamed `structuralGeneration`/`getStructuralGeneration()` to
   `modelGeneration`/`getModelGeneration()` throughout core, the generator template, and both test files,
   since "structural" was no longer accurate.
2. A single-valued cache field for a REQUIRED primitive feature (`tsOptionalScalarType` returning a
   non-optional type, e.g. plain `number`) had no way to represent "not yet computed" - `tsc` correctly
   refused a field with no initializer. Fixed: the cache field's declared type is always
   `{{ tsScalarType(feature) }} | undefined`, decoupled from the feature's own optionality (a cache slot's
   emptiness is an implementation detail, not the feature's nullability) - with a `!` assertion at the
   read site, matching the many-valued case.

**Also found:** `eDidAdd`/`eDidRemove` never fire for hand-written `EClassImpl`'s OWN lists at all (its
fields are built as plain `new BasicEList<T>()`, no owner/feature passed - containment is wired
explicitly via `setEContainingClass` instead, a real, pre-existing, unrelated design choice). More
significantly: hand-written `EModelElementImpl` does NOT extend `EObjectImpl` at all (implements
`EModelElement` directly - a genuinely separate, parallel hierarchy, likely for bootstrapping reasons,
with its own hand-written `eGet`/`eSet`/`eIsSet`/`eUnset`), while GENERATED `EModelElementImpl` DOES
extend `EObjectImpl`. This is a new, previously-undiscovered structural fact directly relevant to the
whole replacement effort - flagged for point 6 (the loader), since the loader's own doc comment claims
hand-written classes "don't support eSet()", which this suggests may be stale now.

**Methodology fix to `check_ecore.py`:** it only ever merged GENERATED metamodel files into the
`workspace.zip` snapshot, never hand-written core changes - this change touched a hand-written file
(`EObjectImpl.ts`) for the first time, and the first re-check against real Ecore.ecore showed 18 false
`tsc` errors ("`getModelGeneration` does not exist") purely because the checker's core was stale, not
because anything was actually wrong. Fixed by having the checker also overlay a short, explicit list of
hand-written core files this session's work has touched.

**Verified:** `@typemf/core` tests (bumps for every feature kind - reference and attribute, many- and
single-valued; is global; a bare owner-less list never fires it at all); a generator test rewritten from
"no cache" (the old, pre-caching assertion) to "a generation-keyed cache, correctly wired"; the full
`type-checks with zero errors, and ACTUALLY RUNS` test in `feature-get-set.test.ts` (which originally
caught bug 1) now passes; a dedicated new test proving the cache is genuinely REUSED (the literal same
`EList` object across repeated calls with nothing changed) AND correctly invalidated by a structural
edit on a completely UNRELATED object (exercising the deliberately-global scope specifically); mutation-
confirmed (a mutation that merely defeats caching - degrading to always-recompute - correctly does NOT
fail anything, since that stays correct; a mutation that skips computing the cache entirely IS caught).
Real Ecore.ecore, merged into the user's workspace layout with the hand-written core patch applied:
strict `tsc` 0 errors, 28/33 checks pass (unchanged from before this point - caching is a performance
fix, not a new-feature fix, so no NEW checks were expected to flip).

## POINT 2 DONE (4 of 5): independent stub bodies

**`EEnum.getEEnumLiteral(name: EString)` / `getEEnumLiteral(value: EInt)` (overloaded) /
`getEEnumLiteralByLiteral(literal: EString)`.** Bodies match hand-written `EEnumImpl`'s already-correct
logic exactly (`getELiterals().find(...)` by name, by value, by literal). The overload dispatch built
earlier this session handles the two-signature `getEEnumLiteral` correctly, with no changes needed there.

**`EFactory.createFromString`/`convertToString`.** Bodies match hand-written `EFactoryImpl`'s existing
default implementations (the primitive-name switch, the ownership check comparing `this.getEPackage()`
against the datatype's own package).

**Real, unplanned findings along the way, not predicted:**

- **Real Ecore.ecore declares NO `EEnum` classifiers at all** - a naive test assuming one existed (e.g.
  `EDataTypeInstanceKind`) failed outright. Had to hand-build an `EEnumImpl` instance instead.
- **An ordinary, user-defined `EEnum` classifier compiles to a plain native TypeScript `enum`, with no
  method-bearing class at all** - `getEEnumLiteral` etc. only exist as real, callable methods on the
  SELF-HOSTED `EEnumImpl` class (i.e. only when generating Ecore.ecore itself). A first version of the
  generator-suite test tried to exercise these against an ordinary hand-built domain metamodel and found
  no such file in the output at all - confirmed directly, not assumed. Rebuilt to exercise the real
  fixture in `generate-ecore: true` mode instead.
- **Self-hosted output cannot run in isolation, at all - not just for type-checking.** Even bare
  execution needs `BasicEList.js`, `EObjectImpl.js`, `EFactoryImpl.js`, `EObject.js` - hand-written files
  self-hosting mode deliberately imports rather than regenerates, none of which exist in an isolated temp
  directory. Confirmed directly (a `Cannot find module './BasicEList.js'` runtime error, then 221
  cascading `tsc` errors for the same underlying reason when a full-program check was tried first). The
  generator's own test suite can therefore only verify these 4 bodies at the TEXT/codegen level, not by
  executing them - the authoritative runtime verification is `check_ecore.py` against the real, full
  workspace (below), which already did execute them successfully.
- **`EFactory.ePackage`'s opposite wiring never fires, even through the ordinary public setter** -
  confirmed directly: `pkg.setEFactoryInstance(factory)` goes through `eSet` (which does trigger
  `eInverseAdd`/opposite wiring in general), yet `factory.getEPackage()` stays `undefined` afterward.
  Root cause: `ePackage` is `changeable="false"`, and `eBasicSetValue` (which `eInverseAdd` uses for the
  actual write) only gets a case for `changeable` features - so the opposite-wiring call silently no-ops.
  This makes the `createFromString`/`convertToString` ownership check permanently inert in the real
  self-hosted bootstrap today (its own `this.getEPackage()` is always `undefined`, so the guard's
  condition never fires) - a SEPARATE, pre-existing gap, unrelated to these two bodies and NOT fixed here
  (out of scope for point 2). The bodies themselves are correct and were verified against a hand-wired
  scenario where ownership genuinely differs.

**Verified:** a new core-adjacent real-execution check (`/tmp/vpoint2`, merged into the real workspace,
same method as `check_ecore.py`) - `getEEnumLiteral` dispatched correctly by name and by value, on a
hand-built `EEnumImpl`; `createFromString`/`convertToString` round-trip real primitives via the actual
self-hosted `EFactoryImpl.create...` bodies; the (inert, as described above) ownership check confirmed to
behave exactly as its own condition says. A new generator-suite test
(`point2-stub-bodies.test.ts`) checks the generated dispatch/body text directly, since execution isn't
achievable in isolation. Real Ecore.ecore, merged into the user's workspace layout: strict `tsc` 0 errors,
stub count down to 4 (from 8), 28/33 checks pass (unchanged count - these 4 operations weren't tracked
checks themselves, they were part of the stub list).

## `EStructuralFeature.getContainerClass` - needs a decision, not implemented

Its return type is `EJavaClass<unknown>` (`TypeScriptClass<unknown>`) - the constructor of the feature's
containing class. Checked directly: nothing in `EClass`, `EClassifier`, `EPackage`, or `EFactory`'s type
definitions holds any reference from a metaobject back to its own generated constructor. Real options,
not decided:

1. **Add new state**: a settable property (on `EClass`, or reusing `EClassifier.instanceClassName` for a
   different purpose than it has today) holding a constructor reference, populated during bootstrap.
2. **Derive it indirectly** via the factory (`getEFactoryInstance().create(eClass).constructor`, say) -
   cheap to build, but constructs a throwaway instance just to read its constructor, and doesn't work for
   an abstract/interface `EClass` at all (nothing to construct).
3. **Leave it a stub** (current state) - nothing in `xmi`/`json`/`node` calls it today (confirmed earlier
   in this project), so this has no active cost.

Point 3 (operations at runtime) is next regardless of this decision.

## DIAGNOSTIC: the real `packages/core` test suite against the swapped-in generated metamodel

Run before point 3, as requested - my OWN canonical workspace's test suite (the uploaded `workspace.zip`
has none at all, confirmed by checking it directly: zero `.test.ts` files anywhere in it), copied to a
scratch location, generated `impl`/`types`/`util` overlaid into `packages/core/src/metamodel` (hand-
written-only foundational files like `BasicEList.ts`/`EObjectImpl.ts`/`EFactoryImpl.ts`/
`DynamicE*Impl.ts` preserved, not deleted - they have no generated counterpart at all). Strict `tsc` of
the WHOLE `core` package (including its own `__tests__`): 93 errors, all attributable to five distinct,
now-identified causes - none of them a correctness gap in the generated metamodel itself.

1. **`EClass.createInstance()` - hand-written-only, used pervasively** (`dynamic-eobject.test.ts`,
   `resource-set.test.ts`, `eclass-reflection.test.ts`, `opposites.test.ts`). A convenience shorthand for
   `eClass.getEPackage()?.getEFactoryInstance()?.create(eClass)`, with a clear error message. Not part of
   real EMF's own `EClass` API, not derived from any Ecore.ecore operation - a TypeMF-specific addition.
   **Needs a decision:** add it as a real, model-driven operation (a new `<eOperations>` on `EClass` with
   a `body`), or migrate every caller to the two-step form.
2. **`recomputeAllLists()` - hand-written-only, obsolete for generated code** (`eclass-reflection.test.ts`,
   `opposites.test.ts`, `reflective-eget-eset.test.ts`). Generated code's `get`-bodied caching
   (point 1, already done) needs no explicit recompute call at all - correct behavior, not a gap. These
   call sites should simply be deleted, not replaced.
3. **`getEStructuralFeatureByName` - a naming mismatch, not a missing capability.** Confirmed: it's
   hand-written core's own non-overloaded name for exactly what generated `getEStructuralFeature(name:
string)` (the string overload, built earlier this session) already does. Found in BOTH a test
   (`eclass-reflection.test.ts`) AND real, hand-written PRODUCTION code outside `metamodel/` entirely -
   `resource/eobject-address.ts` (positional-path resolution) calls it directly. **Actionable now:** that
   production call site needs updating to `getEStructuralFeature(featureName)` for the swap to work at all.
4. **`EEnumImpl.addLiteral()` - a workaround that becomes unnecessary, not a gap.** Its own doc comment
   explains why it exists: "EEnumLiteral is not an EObjectImpl, so BasicEList's generic containment wiring
   does not apply to it" - true for HAND-WRITTEN `EEnumLiteralImpl` (confirmed: hand-written
   `EModelElementImpl` and everything under it, including this, do NOT extend `EObjectImpl` at all - the
   same divergence found and documented under point 1). GENERATED `EModelElementImpl` DOES extend
   `EObjectImpl` (also already confirmed), so generated `EEnumLiteralImpl` genuinely is one, and the
   ordinary `getELiterals().add(literal)` already wires the `eEnum` opposite correctly through the
   standard mechanism (`eOpposite="#//EEnumLiteral/eEnum"` is declared on `eLiterals` in Ecore.ecore).
   `addLiteral()`'s special case is obsolete for generated code; callers should use `getELiterals().add()`
   directly.
5. **`EAnnotation.getDetails()` returns `Map<string, string>` (hand-written) vs. `EList<
EStringToStringMapEntry>` (generated, model-faithful) - the one genuinely consequential divergence.**
   Confirmed: hand-written `EAnnotationImpl.getDetails()` returns a native `Map`, a deliberate ergonomic
   wrapper; the real Ecore metamodel (and therefore generated code) represents `details` as an `EList` of
   key/value entry objects, matching real EMF. Every `.get(key)`/`.set(key, value)` call on the result
   breaks - `EList.get()` takes a numeric INDEX, not a string key (confirmed: this is exactly why
   `eannotation.test.ts`'s errors include both a wrong-argument-type and a missing-method flavor - one
   root cause). **Needs a decision:** migrate every caller to the `EList<Entry>` style
   (`.find(e => e.getKey() === k)?.getValue()`), or keep a hand-written `Map`-returning convenience
   alongside the real one (unfaithful to the model - would need to be excluded from what the swap
   actually replaces).
6. **`resource-set.test.ts`'s remaining "Type 'undefined' cannot be used as an index type" errors** - not
   individually root-caused; likely cascading from #1/#5 in the same file (both appear there too).

**Not investigated yet:** none of these 93 errors were fixed - this was a diagnostic, as asked. Doing so
is real, additional work beyond points 1-6 on the main tracker, since #1 and #5 both need a decision
before any code changes, and even the "obsolete, just delete the call" ones (#2, #4) touch test files
across two directories (`metamodel/__tests__`, `resource/__tests__`), not just `metamodel/`.

## DIAGNOSTIC CONTINUED: full "migrate + fix bugs" pass, before point 3

Following the earlier diagnostic (which found `getDetails()` and 5 other API differences), the user asked
to migrate `createInstance` and `getDetails`, then keep going - "make this test chain work, fix bugs we
come across" - before starting point 3. Full account below; end state: 462/462 tests pass in the real,
live workspace (nothing broken there), and the swap diagnostic went from 93 errors -> 0 tsc errors, with
one major, unresolved, scope-defining finding at the very end (see "NEW FINDING" below).

### `getDetails()`: Map -> real EList<EStringToStringMapEntry>

`EAnnotation.getDetails()` migrated from a hand-written-only `Map<string,string>` to the real,
model-faithful `EList<EStringToStringMapEntry>` (a new type + impl added, matching Ecore.ecore's own
declared shape exactly - extends EObject directly, `key`/`value` EString attributes). Two new free
functions, `detailValue(details, key)` / `setDetailValue(details, key, value)`, replace direct
`.get()`/`.set()` calls. Touched ~30 call sites across `core` (1 test file) and `generator` (production
code: `typescript-filters.ts`, `type-import-mapping.ts`, `ecore-dynamic-to-typed.ts`; ~19 test files; and
critically the GENERATOR'S OWN TEMPLATE, `epackage.njk` - its ordinary-mode branch still emitted the old
`.set()` call into GENERATED code, a real bug caught by the 18 real-compile test failures that followed,
not predicted). Also ported to `xmi-serializer.test.ts` and `real-ecore-full-validation.test.ts`,
initially missed by the file-by-file sweep and only caught by a full monorepo compile check.

### `createInstance()`: interface method -> free function `createInstanceOf()`

Removed from the `EClass` interface entirely (never a real Ecore.ecore operation) and reimplemented as a
free function, same error-message behavior preserved. Wider blast radius than expected: it was a
DECLARED INTERFACE METHOD, used in PRODUCTION code in `packages/json/src/json-serializer.ts`, not just
`packages/core`'s own tests - 14 files, 112 call sites total, migrated with a receiver-aware script (naive
regex could not handle nested parens in the receiver expression). Found two real, unrelated bugs while
verifying: (1) `xmi`'s own `dist/` build was stale from an earlier session (never rebuilt after some past
change) and still had the old `.createInstance()` call baked in - surfaced only because this was the
first time the FULL cross-package integration suite ran after this interface change; (2) a genuine
architectural mistake of this session's own making - `createInstanceOf`/`detailValue`/`setDetailValue`
were first placed directly in `EClassImpl.ts`/`EAnnotationImpl.ts`, files the swap overwrites wholesale;
confirmed by actually running the merge (every caller failed with "has no exported member"). Fixed by
relocating all three to a new, dedicated `metamodel-helpers.ts` the swap never touches - a durable lesson
for any FUTURE free function meant to survive the swap: it cannot live in a generated file, full stop.

### `recomputeAllLists()`, `getEStructuralFeatureByName`, `addLiteral()`

Scoped correctly to `packages/core`'s own `__tests__` (and one production file, `eobject-address.ts`) -
NOT `packages/generator`'s tests, which use hand-written classes as legitimate generator INPUT data, never
as a stand-in for swapped generated code, so calls there are fine and untouched.

- `recomputeAllLists()`: obsolete calls deleted outright - generated code's caching (point 1) needs no
  manual invalidation at all, and even hand-written core's own lazy-build-on-first-access behavior means
  removing the explicit call changes nothing observable.
- `getEStructuralFeatureByName`: NOT a simple rename - hand-written `getEStructuralFeature` had ONLY the
  numeric-id form, no string overload at all (confirmed by reading the interface). Added a REAL overload
  (`getEStructuralFeature(name: string)`, dispatched by `typeof` inside one implementation, mirroring the
  generated overload-dispatch shape exactly) and removed the separately-named method entirely. Found via
  a full-monorepo sweep (not just the original diagnostic's file list) two more real production/test call
  sites outside `packages/core`: `packages/generator/src/ecore-dynamic-to-typed.ts` (the old-pipeline
  converter) and `packages/xmi/src/__tests__/xmi-serializer.test.ts`.
- `addLiteral()`: confirmed safe to migrate to plain `getELiterals().add(...)` for the one test that used
  it (`freeze.test.ts`) - its freeze-cascade assertion doesn't depend on the `eEnum` opposite backpointer
  `addLiteral()` used to wire manually. That manual wiring was itself only needed because hand-written
  `EEnumLiteralImpl` doesn't extend `EObjectImpl` (see the `getModelGeneration()` write-up in point 1)
  and so never got the generic opposite-wiring `eDidAdd` provides; GENERATED `EEnumLiteralImpl` DOES
  extend it, so `addLiteral()`'s special case is now genuinely obsolete for generated code, not just
  differently-named.

### NEW: `getName()` - a real type-signature divergence, migrated

Discovered by the diagnostic itself, not anticipated: hand-written `ENamedElement.getName(): string`
(never undefined) vs. generated `getName(): string | undefined` (matching real EMF - `name` is a
genuinely optional attribute). Migrated the interface, `ENamedElementImpl` (removing a `''`-as-sentinel
workaround its own doc comment said existed ONLY because of the old non-optional signature - now a real
`undefined` sentinel, matching real EMF's NAME_EDEFAULT = null), and `EEnumLiteral.getLiteral()`
(falls back to `getName()`, so had to become optional too). Blast radius: 15 errors in `core` itself (1
real production file, `eobject-address.ts`, fixed with a clear thrown error since an unnamed containing
feature makes a positional path meaningless; the rest test-fixture code where a non-null assertion is
safe and justified, since the fixtures always set names); 6 in `json` (2 production fixes with real
judgment calls - `eclass-ref.ts` throws a clear error, since an unnamed class cannot be referenced by
name at all; `json-serializer.ts` SKIPS an unnamed feature during (de)serialization rather than crashing
the whole object, matching this same loop's existing skip-if-unusable pattern for an unset feature); 41
in `generator`, ALL in `typescript-filters.ts` - resolved not by scattering individual checks but by
adding a new validation function, `findUnnamedElements()`, wired into the existing `validate()` hook
(the same mechanism `findUnresolvedCollisions` already used) - since code generation genuinely cannot
proceed for an unnamed classifier/feature/operation/parameter/enum literal, checking this once, up front,
lets every other function in the file safely assert non-null, exactly mirroring why `findUnresolvedCollisions`
exists in the first place. New test file `unnamed-elements.test.ts` (4 tests) covers the new function.

### NEW FINDING, confirmed but NOT resolved - central to point 6, changes its scope

With every fix above applied, the full swap diagnostic (merge generated code into a scratch copy of the
REAL workspace, `tsc`, full `vitest run`) reached **0 `tsc` errors** - a first. But running the actual
existing test suite against the swapped-in implementation: 105 of 128 tests FAILED at runtime, all with
the same error: `getEcorePackageRef() called before the EcorePackage singleton finished constructing
itself.` Root cause, confirmed by reading the generated code directly: EVERY generated setter (not just
some) routes through `this.eSet(getEcorePackageRef().get{Class}_{Feature}(), value)` - meaning ANY
generated class needs Ecore's OWN metaclass system fully bootstrapped before it can be constructed and
have ANY field set, including `setName()`. `packages/core`'s own test suite constructs Ecore metaclasses
DIRECTLY as fixtures (`new EDataTypeImpl(); dt.setName(...)`), with NO loader involved at all - so every
one of these breaks once real generated classes back them.

Investigated, not guessed: tried auto-bootstrapping inside `getEcorePackageRef()` itself - NOT safe.
`EcorePackageRef.ts`'s own doc comment explains it deliberately uses ONLY a type-only import specifically
to avoid a circular dependency with `EcorePackageImpl` (a real hazard already hit and fixed earlier in
this project - "a real failing bundle... while building this generator, not assumed"). Importing
`EcorePackageImpl` there to auto-bootstrap would reintroduce exactly that.

Applied ONE targeted, diagnostic-only fix (triggering `EcorePackageImpl.eINSTANCE` in the one shared test
helper, `sample-metamodel.ts`, NOT applied to the real, live workspace, since that file is shared with
the NON-swapped state and `impl/EcorePackageImpl.ts` does not exist there) - failures dropped from 105 to
57, confirming the SAME root cause is widespread, not isolated to one helper. Stopped there rather than
mechanically patching the remaining 57 (spread across several test files that construct metaclasses
independently) - patching test-by-test inside a throwaway scratch copy would not be a real fix and
would not carry forward anywhere.

**Decision (user, this session): lean toward NOT mechanically fixing every test file.** The real,
open question for point 6: is this only a `packages/core`-test-authoring concern (in which case
`packages/core`'s OWN tests may need to stop constructing raw Ecore metaclasses directly, once the swap
happens, and go through a loader/factory path instead - sidestepping the ordering problem entirely,
since any real loader would bootstrap Ecore.ecore's own package first, before anything else) - or does
it reach further than that. Point 6 must now explicitly answer this before the actual swap (point 7) can
proceed, not just "confirm the loader still compiles" as originally scoped.

**State check**: the real, live workspace is untouched by any of this diagnostic - all fixes described
above (getDetails, createInstance, recomputeAllLists, getEStructuralFeatureByName, addLiteral, getName)
ARE committed to the live workspace and verified; 462/462 tests pass there. Only the bootstrap-ordering
finding and its one partial fix exist solely in a throwaway `/tmp` scratch copy, exactly as intended.

## POINT 3 DONE: operations exist at runtime

**Root cause, confirmed by reading the bootstrap template directly, not guessed:** for every structural
feature, `epackage.njk` already had a complete bootstrap pass - construct a real `EAttributeImpl`/
`EReferenceImpl`, set its name/type/bounds/featureID, wire its `eContainingClass` back-pointer, add it to
the classifier's `eStructuralFeatures` list. There was NO equivalent for operations anywhere - zero
constructions of `EOperationImpl`/`EParameterImpl` in the whole template. The generated METHOD (a real,
callable `getEStructuralFeature(name)`, `isSuperTypeOf(other)`, etc.) always worked; only the reflective
metaobject describing it at runtime never got built.

**Fix**: a new bootstrap pass ("Pass 2.5"), directly mirroring the existing feature pass. For every
operation: construct `EOperationImpl`, set name/return-type/`eContainingClass`; for every parameter:
construct `EParameterImpl`, set name/type/bounds/`eOperation` (the back-pointer); for every declared
exception: add the existing classifier to `eExceptions`; carry over annotations (`emitAnnotations`, same
as features); add the operation to the classifier's `eOperations`. Fields indexed by POSITION
(`_{ClassName}_op{N}`, `_{ClassName}_op{N}_p{M}`), not name - operations can be legitimately overloaded
(the same name, several signatures), so a name-keyed field would collide. All the `Ids` table entries
needed (`Ids.EClass.eOperations`, `Ids.EOperation.eContainingClass`, `Ids.EOperation.eParameters`,
`Ids.EParameter.eOperation`) already existed automatically - confirmed by reading the generated output,
not assumed - since `EOperation`/`EParameter` are real classifiers with these as real declared features,
and the `Ids` table is built generically from every classifier's own feature list.

**A real, necessary addition to hand-written `@typemf/core`, found by the first test run, not
anticipated:** the SAME template change also runs in ORDINARY (non-self-hosting) mode, where
`EOperationImpl`/`EParameterImpl` come from hand-written core, not generated code - and hand-written core
had no `getEContainingClass`/`setEContainingClass` on `EOperationImpl` or `getEOperation`/`setEOperation`
on `EParameterImpl` at all. 7 existing generator tests broke immediately, all with the same two missing
methods. Added both, mirroring `EStructuralFeatureImpl.eContainingClass`'s exact existing pattern
(transient, non-changeable, readable via `eGet`, not settable via `eSet` - matching real EMF). New core
tests added for both (`reflective-eget-eset.test.ts`); all 7 broken generator tests pass again.

**Verified, several rounds - two of my own early test assertions were wrong, not the implementation, each
confirmed against the model directly rather than argued from memory:** a real end-to-end check
(`EcorePackageImpl.eINSTANCE.getEClass().getEOperations()` against the actual self-hosted output) first
failed an assumption that every operation name would be unique - checked the model directly and found
`getEStructuralFeature` is genuinely declared twice (the number/string overload built earlier this
session) - real EMF represents an overloaded operation as two separate `EOperation` objects with the
same name, which is exactly what this fix now does correctly, confirmed by checking both parameter types
resolve to `EInt` and `EString` respectively. A second assumption (a parameter named `other`) was also
wrong - checked the model, the real name is `someClass` - fixed the test, not the implementation. Beyond
that: `eAllOperations` correctly aggregates 12 (9 own + 3 inherited, confirmed as real, distinct objects,
not merely equal ones); a parameterless operation has a genuinely empty `eParameters` list, not
`undefined`; `eContainingClass` is a real back-pointer to the literal containing object. A NEW,
dedicated generator-suite test (`operations-runtime.test.ts`) covers the ORDINARY-mode path specifically
with real execution (not just compilation, which is all the 7 previously-broken tests checked) - a hand-
built package, `Widget.describe(verbose)` generated as a real method AND as a real `EOperation` object
with the right name/parameter/back-pointer, and the actual generated method still callable and correct.
Mutation-confirmed: removing the final `bootstrapAdd` call (operation constructed and configured, but
never actually added to `eOperations`) is caught by this new test.

Real Ecore.ecore, merged into the user's workspace layout: strict `tsc` 0 errors, checker:
`runtime.operations.runtime` (`EClass.getEOperations()`) now **9 found / 9 declared** (was 0), `runtime
.operationCount` **12/12**, `runtime.derived.eAllOperations` **12/12** - all three of the checks this
point specifically existed to fix now pass. Stub count unchanged at 4 (getOperationID/isOverrideOf/
getOverride still throw - point 4's job, now unblocked, since real `EOperation` objects exist for them
to operate on) - `EStructuralFeature.getContainerClass` remains the one needing a design decision (D3).

## POINT 4 DONE: EOperation.getOperationID, EOperation.isOverrideOf, EClass.getOverride

**`getOperationID` - matched `featureID`'s pattern exactly, per direct user request, not a body
annotation at all.** Extended `id-assignment.ts`'s existing `assignFreshIds()` to also walk
`getEAllOperations()` (inherited-then-own, one flat ID space - the same rationale as `featureID`) and
assign `operationID` by position. On the generated side, found and reused the EXISTING mechanism built
for this exact class of problem: `isBookkeepingOperation()`, which already special-cased
`getClassifierID`/`getFeatureID` to skip generating a throwing-stub method that would collide by name
with a hand-added, correct one. Added `isOperationDerived()` (the direct analog of
`isClassifierDerived`/`isStructuralFeatureDerived`) and one more line in `isBookkeepingOperation` for
`getOperationID` on `EOperation`. `eclass.njk` gained one more `{% if eClass.getName() == "EOperation" %}`
block (mirroring the existing `EClassifier`/`EStructuralFeature` ones exactly) providing the real
`operationId` field and accessors. Required adding `getOperationID`/`setOperationID` to hand-written
`@typemf/core`'s `EOperation` interface and `EOperationImpl` too, for ordinary (non-self-hosting) mode.

**`isOverrideOf`/`getOverride` - real EMF's own algorithm, exactly, per direct user request:**

- `isOverrideOf(someOperation)`: false if `someOperation === this`; false if the two operations'
  containing classes are the same; false unless the OTHER operation's containing class is a real
  supertype of THIS operation's containing class (via `isSuperTypeOf`, correct since earlier this
  session); false unless names match; false unless parameter counts and each parameter's `eType` match
  pairwise (direct classifier identity - real EMF's own erased-type comparison, no generic-substitution
  logic needed since no operation in this model uses type parameters). True otherwise.
- `getOverride(operation)`: `undefined` if `operation`'s own containing class is `this` (an operation
  cannot override itself via its own declaring class); otherwise the first operation in
  `this.getEAllOperations()` for which `candidate.isOverrideOf(operation)` is true, `undefined` if none.

**Verified, real execution against a hand-built hierarchy with a genuine override (Base -> Middle ->
Leaf, `describe()` redeclared on Leaf), not just the checker's counts:** direction-sensitivity confirmed
(`leafOp.isOverrideOf(baseOp)` true, the reverse false); self-override and unrelated-class exclusion both
confirmed; `getOverride` confirmed to return the literal correct object (`leaf.getOverride(baseOp) ===
leafOp`), and `undefined` for both an operation's own declaring class and an unrelated intermediate class
that declares no override. Against the real self-hosted metamodel: every `operationID` on `EClass`'s own
operations is distinct and non-negative (one flat space, no collisions), and critically, the two
`getEStructuralFeature` overloads (same name, different signatures) get genuinely DIFFERENT
`operationID` values, confirming the bookkeeping fix correctly treats them as the two separate objects
they are. A new generator-suite test (`point4-stub-bodies.test.ts`) checks the generated text directly
(same text-only rationale as point 2's tests - self-hosted output cannot run in isolation); a new core
unit test confirms `operationID` is a plain stored field, defaulting to -1, not reachable via `eGet`
(matching `featureID`'s own bookkeeping-only exclusion exactly).

Real Ecore.ecore, merged into the user's workspace layout: strict `tsc` 0 errors, stub count down to
**1** (from 9 at the very start of this diagnostic arc) - only `EStructuralFeature.getContainerClass`
(D3) remains, still needing a design decision (new infrastructure: nothing currently maps an `EClass`
metaobject to its own generated constructor). 31/33 checks pass (unchanged from point 3 - these two
operations weren't independently tracked checks, they were part of the stub list).

## POINT 5 DONE: EGenericType.eRawType

**Real EMF's algorithm, confirmed against the exact declared shape first, not assumed:** `eRawType` is
`derived`, `lowerBound="1"` (always resolves to something in real EMF), returning the "erased" classifier

- Java's own "raw type" terminology (`List` from `List<String>`). Resolves: a real `eClassifier` directly;
  otherwise, for an `eTypeParameter` reference, through that parameter's own first `eBounds` entry,
  recursively; otherwise, for a wildcard (`eUpperBound`/`eLowerBound`), through the upper bound, recursively;
  otherwise falls back to Java's `Object`.

**A related, deeper gap found while scoping this, per the user's own suggestion to check it:** hand-written
`ETypedElementImpl.setEGenericType()` computed `eType` as `type?.getEClassifier()` directly - a shortcut
that only works for the plain-classifier case, silently wrong (returns `undefined`) for a type-parameter
or wildcard reference. Fixed to use the real `getERawType()` instead - though for HAND-WRITTEN core
specifically this is a correctness-by-name fix with no _observable_ behavior change today, since this
port's hand-written `EGenericType`/`ETypeParameter` don't model bounds or wildcards at all (their own,
pre-existing doc comments already say so) - so `getERawType()` there reduces to exactly what
`getEClassifier()` already did. Disclosed as a known, honest limitation rather than worked around:
hand-written `getERawType()` can return `undefined` for an unbound type parameter, unlike real EMF's
always-resolves-to-something guarantee - the self-hosted, generated version (used when reflecting on
Ecore.ecore itself) has the full model and does not have this gap.

**A second, previously entirely-missing piece, also found while scoping, not originally planned:** real
EMF's own generated `setEGenericType()` ALSO sets `eType` as a side effect - confirmed this was missing
from GENERATED code too (not just hand-written), since `eType` and `eGenericType` are independently
stored features in the model itself (`eType` is not `derived`), so the coupling is deliberate custom
setter logic, not something the reflective machinery would produce on its own. Added as this session's
first real usage of a custom SETTER body (`https://typemf.dev/generator/feature`, key `set`) in
Ecore.ecore itself - previously only tested in isolation, never used in the real model. The custom body
replicates the default single-valued `eSet` dance exactly (`eBasicSetValue` + `eDidRemove(old)` +
`eDidAdd(new)`, preserving containment/opposite/notification correctly, confirmed by testing that
containment specifically is NOT silently dropped) rather than bypassing it, then adds the extra
`setEType(value?.getERawType())` step.

**Two real, unplanned mistakes caught by testing, not by review, each confirmed against the actual code
before fixing:**

1. First draft of the fallback called `getEcorePackageRef().getEObject()` - `tsc` caught this
   immediately (`Property 'getEObject' does not exist`). Root cause: `EObject` is deliberately excluded
   from ALL generated-class treatment in this port (a pre-existing, intentional design decision, found by
   reading `typescript-filters.ts` directly), and more fundamentally, real EMF's actual fallback here is
   Java's `Object` (`java.lang.Object`), a different concept from EMF's own `EObject` base interface -
   this port already models Java's `Object` as `EJavaObject`, a normal, always-generated classifier.
   Switched the fallback to `getEJavaObject()`.
2. `typeParameter.getEBounds().get(0)` threw a `RangeError` on an empty list at real runtime - this
   port's `EList.get(index)` throws on out-of-bounds access rather than returning `undefined` (unlike a
   plain array), confirmed by a real execution test with a genuinely unbound type parameter. Fixed by
   checking `!getEBounds().isEmpty()` before indexing.

**Verified, real execution against the self-hosted output, four distinct scenarios:** a plain classifier
resolves to itself; a type parameter with a real bound resolves through it recursively (the bound object
itself, not a copy); a type parameter with NO bound correctly falls back to the real `EJavaObject`
classifier (the exact case that caught bug #2); the custom setter's `eType` side effect fires via the
real algorithm AND containment is still correctly wired (`gt.eContainer() === attr`, confirming the
custom setter body's replicated `eSet` dance genuinely works, not just compiles). Core-side: 3 new unit
tests for `getERawType()` and its honest `undefined` case, mirroring hand-written core's actual,
disclosed limitation. A new generator-suite test (`point5-erawtype.test.ts`) checks the generated text
directly (same text-only rationale as points 2/4's own tests).

Real Ecore.ecore, merged into the user's workspace layout: strict `tsc` 0 errors, stub count still **1**
(`eRawType` was never on the stub list - it was silently returning nothing meaningful before, not
throwing, so the checker's stub-detector never flagged it; only `EStructuralFeature.getContainerClass`
(D3) remains).

## D3 DONE: EStructuralFeature.getContainerClass - ALL STUBS NOW CLOSED (0 remaining, from 9 at the start)

**The design, given directly by the user, citing real EMF's own actual implementation** (Ecore's
generated `initEStructuralFeature`/`initEAttribute`/`EcorePackageImpl`, quoted in full): `containerClass`
is a plain field on the IMPL class, set once during bootstrap with a literal `Class<?>` value (e.g.
`EClassifier.class` for `EClassifier.instanceClassName`); `getContainerClass()` is public (a real,
reflectively-callable operation); `setContainerClass` is deliberately NOT on the public
`EStructuralFeature` interface at all - only reachable by casting to the concrete impl. Implemented
exactly this way, closing the one open design question (D3) that had been blocking this since it was
first found.

**One real, necessary adaptation, disclosed rather than silently made:** real EMF's `containerClass`
holds the DECLARED JAVA INTERFACE's class object (`EClassifier.class`). TypeScript interfaces have no
runtime existence at all - there is nothing analogous to call `.class` on. The closest real, inspectable
value TypeScript has is the concrete GENERATED IMPLEMENTATION class (e.g. `EClassifierImpl`), so that is
what `containerClass` holds here - a deliberate, necessary divergence from literal Java semantics, not
an oversight.

**A genuinely missing piece, found while implementing, not part of the original ask:** `TypeScriptClass<T>`

- the real EMF `EJavaClass`'s already-established TypeScript mapping (`type: "TypeScriptClass"`, `from:
"@typemf/core"`) - had never actually existed in hand-written `@typemf/core` at all. Every verification
  script this whole session had been manually creating a STAND-IN file for it. Added for real: `export type
TypeScriptClass<T> = new (...args: unknown[]) => T;`, exported from the public barrel.

**Implementation, mirroring `featureID`/`classifierID`/`operationID`'s exact, already-established
pattern** (not a body annotation - internal bookkeeping the reflective `eGet`/`eSet` machinery does not
see): `isBookkeepingOperation` extended for `getContainerClass` on `EStructuralFeature`-derived classes;
`eclass.njk` gained the field/getter/setter inside the existing `EStructuralFeature` special-case block,
alongside `featureID`; `epackage.njk`'s bootstrap pass gained one more unconditional line (matching
`featureID`'s own unconditional treatment, since neither goes through the reflective `eSet` system),
importing and referencing each feature's own declaring classifier's impl class directly as a value - the
literal analog of `EClassifier.class` in the Java source the user quoted.

**A real compile error caught immediately, not predicted**: the first draft referenced
`{classifier}Impl` for every feature's declaring classifier without importing it - `tsc` immediately
flagged `EClassifierImpl` (and 5 others) as undefined, since only classifiers ALREADY needed elsewhere in
the same file happened to already be imported. Fixed with a `useImport` call at the point of use,
mirroring the existing superclass-import pattern in the same file exactly.

**Verified, real execution against the self-hosted output:** a feature declared on `EClassifier`
(`instanceClassName`) reports the literal `EClassifierImpl` constructor - not a copy, not a name string,
the actual class object, confirmed with `toBe`; a feature declared on `EAttribute` (`iD`) reports the
literal `EAttributeImpl`, confirmed distinct from `EClassifierImpl`; the container class is a genuinely
USABLE constructor - `new (feature.getContainerClass())()` produces a real instance of the right class,
not just an inert reference. In `packages/core`'s own suite: a real, compile-time `@ts-expect-error`
check proves `setContainerClass` is genuinely absent from the public `EStructuralFeature` interface, not
just present-but-discouraged - mutation-confirmed (removing the directive fails the whole file to
compile). A new generator-suite test checks the generated text directly (same text-only rationale as
every other self-hosting-only point this session), including that the needed import actually lands.

Real Ecore.ecore, merged into the user's workspace layout: strict `tsc` 0 errors, **stub count: 0** (from
9 at the very start of this whole diagnostic arc). 32 of 33 checks pass - only the cosmetic, long-known
`static.useTypeName` remains, unrelated to any of this work.

**Follow-up, prompted by the user asking whether this needed further tracking:** the D3 write-up above
only had real-execution verification for the SELF-HOSTED case (the only one `check_ecore.py` can reach).
Since `containerClass`'s bootstrap wiring is unconditional (matches `featureID`'s own treatment), it also
runs for ORDINARY (non-self-hosting) packages - the case most real users actually hit - and that path had
only been confirmed by "the whole suite still compiles," not dedicated real execution. Checked directly:
a hand-built ordinary package's own feature correctly reports its declaring class's real, literal,
USABLE constructor (`labelFeature.getContainerClass() === WidgetImpl`, and `new
labelFeature.getContainerClass()()` produces a genuine `WidgetImpl` instance) - confirmed working
correctly, not a gap after all. Added as a permanent test (`containerclass-ordinary-mode.test.ts`)
rather than left as a one-off check, so this stays verified going forward. Full monorepo: 474 tests, all
passing.

## POINT 6 DONE: loader pipeline dependency

Two separate questions, both resolved.

**Bootstrap-ordering (from the earlier diagnostic): confirmed narrow, not a production concern.** Every
real usage path this whole session - every ordinary-mode generation test, every self-hosted verification
via `check_ecore.py` - goes through `{Pkg}PackageImpl.eINSTANCE`, which naturally bootstraps everything
in the right dependency order and never hits the "called before the EcorePackage singleton finished
constructing itself" error. It only bites `packages/core`'s own test FIXTURES, which construct Ecore
metaclasses directly, bypassing any loader entirely - a test-authoring pattern, not a real one.

**Could not apply the mechanical fix (`void EcorePackageImpl.eINSTANCE;`) to `packages/core`'s live test
files now, and that's correct, not an oversight**: `packages/core`'s live codebase has no
`EcorePackageImpl.ts` at all - that file only exists once generated code is actually swapped in (point 7).
Adding a reference to it now would fail to compile. Instead, produced the concretely useful thing point 7
actually needs: a precise inventory, computed now rather than rediscovered later, of exactly which test
files will need the fix once the swap happens - every file constructing an Ecore metaclass directly
(`new EClassImpl()` etc.), NOT through the already-fixed shared `sample-metamodel.ts` helper:

```
src/resource/__tests__/eobject-address.test.ts
src/metamodel/__tests__/generic-types.test.ts
src/metamodel/__tests__/dynamic-eobject.test.ts
src/metamodel/__tests__/reflective-eget-eset.test.ts
src/metamodel/__tests__/eclass-reflection.test.ts
src/metamodel/__tests__/opposites.test.ts
src/metamodel/__tests__/freeze.test.ts
src/metamodel/__tests__/instance-class-name.test.ts
src/metamodel/__tests__/model-generation.test.ts
src/metamodel/__tests__/efactory-impl.test.ts
```

(`resource-set.test.ts`, flagged as affected in the earlier diagnostic, is NOT actually on this list -
checked directly: it builds its model entirely through the shared, already-fixed helper, so it needs
nothing further.)

**Loader compatibility: confirmed working, not theoretically but by continuous use** - every single
generation this entire session, including the final one carrying all of points 1-5 and D3, went through
`ecore-meta-schema.ts` + `ecore-dynamic-to-typed.ts` successfully. Nothing here needs to change for the
swap to work; the loader operates entirely on hand-written classes and is unaffected by what backs
`packages/core`'s own metamodel classes.

**The stale "eSet() doesn't work" claim - fixed, not just noted.** Checked directly rather than assumed:
hand-written `EClassImpl.eSet()` genuinely handles every real, modeled feature now (`abstract`,
`interface`, `eSuperTypes`, `eStructuralFeatures`, `eOperations`, `name`, and more - built up across
this whole session). Corrected the comment in both `ecore-loader.ts` and `ecore-dynamic-to-typed.ts`
to state the REAL, still-valid reason the two-step shape remains necessary: bookkeeping fields
(`classifierID`/`featureID`/`containerClass`/`operationID`) are deliberately unreachable via `eSet()` by
design (matching real EMF exactly, the same pattern used throughout points 3/4/D3), so a pure
`eSet()`-driven read could never be sufficient on its own regardless of how complete `eSet()` support
becomes.

**Deliberately NOT attempted: rewriting `ecore-dynamic-to-typed.ts` (342 lines) to reduce its size.**
Real opportunity, but real risk that outweighs it here: this file's own comments document several
genuine, previously-hard-to-find bugs already fixed (the `EObject`-classifier exclusion, `
copyFeatureFlags`'s "silently broke ... for every real file this pipeline has ever converted" note, the
deferred opposite-wiring pass) - a rewrite risks silently reintroducing any of them for a code-size
benefit alone, with nothing currently broken to justify the risk. Left as-is; flagged here rather than
silently dropped, in case a future point wants to revisit it with its own dedicated verification budget.

Full monorepo: 474 tests, all still passing (comment-only changes here, confirmed no regressions).

## POINT 7 DONE: the actual swap

`packages/core/src/metamodel` now runs on generated, self-hosted code throughout `impl/`, `types/`,
and `util/` - hand-written classes remain only where they must (`BasicEList.ts`, `EObjectImpl.ts`,
`DynamicEObjectImpl.ts`, `DynamicEFactoryImpl.ts`, `metamodel-helpers.ts`, `EList.ts`/`EObject.ts`'s
interfaces, `TypeScriptClass.ts`, `EEnumerator.ts`). Full monorepo: **475/475 tests passing** across
core (136), generator (298), json (11), xmi (21), node (9). `tsc --noEmit` clean in every package.

**Stability confirmed**: regenerating Ecore.ecore's own output through the real pipeline, now
depending on the fully-swapped core, produces output byte-for-byte identical to what's currently
deployed - diffed directly, not assumed. The generator is a genuine fixed point.

### Real bugs found and fixed along the way (not predicted - found by actually running the swap)

Point 6's bootstrap-ordering fix was applied for real this time, not just diagnosed: the shared
`void EcorePackageImpl.eINSTANCE;` trigger, at every place a package constructs Ecore metaclasses
directly - `packages/core`'s 10 identified test files plus `sample-metamodel.ts`, and equivalent
fixtures newly discovered in `generator`, `json`, `xmi`, and `node`. Also discovered the trigger was
needed one level earlier than expected: `ecore-meta-schema.ts` (called before
`convertDynamicEcoreToTyped`) needed it too, so it now lives once, at the earliest point, in
`ecore-loader.ts`'s own `loadEcorePackage()`.

**`getEStructuralFeature`/`getEOperation` searched own-only, not all-inherited** (points 2/4's own
generated bodies) - an inherited feature or operation was invisible to reflective lookup by name or
ID. Fixed in the model.

**`eBootstrapList()` broke point 1's cache invalidation** - its lists were constructed with an owner
but no feature, so `eDidAdd`/`eDidRemove` never fired for structural bootstrap writes, meaning the
generation counter never bumped for them. Fixed by separating "bump the counter" (needs only an
owner) from "run containment/opposite logic" (needs a real feature) in `EObjectImpl`/`BasicEList`.

**`changeable=false` was never enforced** - `isReadOnlyFeature()` only ever checked derived formulas
and custom-getter-without-setter, never `changeable` itself, so non-changeable fields like
`eContainingClass`/`ePackage`/`eOperation`/`eSuperPackage` were silently settable via reflective
`eSet`. Fixed with a real three-way distinction: fully read-only (no setter anywhere), impl-only
(a new `needsImplOnlySetter()` - real EMF's own convention: a plain, unnotified setter that exists
but isn't public or reflective), and normal (full public setter + `eSet` case).

**`primitiveDefaultValue()` never read a feature's own `defaultValueLiteral`** - always defaulting
booleans to `false` regardless of what the model declared, which is what made the `changeable` fix
look broken at first (the metaclass describing `changeable` itself defaulted to the wrong value).
Fixed to read the feature's real declared default when present.

**`EEnumLiteral.literal`'s fallback-to-name getter needed three separate fixes**, once traced
through: the wrong annotation source URI (`.../generator` vs the correct `.../generator/feature`),
the field-declaration gate wrongly assuming "custom getter → no backing field" (broke for a feature
whose getter _and_ setter both reference their own field), and `eIsSet`/`eUnset` wrongly calling the
fallback-augmented getter instead of checking the raw field. Generalized as a new
`customBodyNeedsOwnField()` (checks whether the getter/setter body text actually references
`this._<name>`, not just whether both exist) - caught and fixed a real overreach of an earlier,
blunter version of this same fix, which broke a getter/setter pair that delegates entirely to a
_different_ feature (found by rerunning `packages/generator`'s own suite after the first attempt).

**`EClass.getEIDAttribute()` had silently degraded to a dead, always-undefined stored field** - marked
`derived="true"` in the model but with no matching `get` body annotation, so it never actually
computed anything. A real, pre-existing gap the swap exposed, not something introduced by it. Fixed
with a body annotation restoring the real computation (`getEAllAttributes().find(a => a.isID())`).

**`eClassifiers`' `eOpposite` is never wired on the self-hosted bootstrap's own metaclass
descriptions** - a separate, pre-existing gap (the bootstrap template never sets `eOpposite` at all
for any feature). Confirmed by direct testing rather than assumed; the explicit
`classifier.setEPackage(pkg)` calls various tests and the loader itself already had turned out to be
necessary, not redundant, and were restored (cast to the impl type, since `setEPackage` is
impl-only) rather than removed.

**`setEGenericType()` and the new `setEType()` custom setter conflicted**: giving `eType` its own
custom setter (to clear `eGenericType` when set directly, matching hand-written core's old behavior,
itself a real, previously-unported behavior) broke `setEGenericType()`, which called
`this.setEType(...)` as its own side effect - immediately undoing the `eGenericType` it had just set.
Fixed by having `setEGenericType()` write `_eType` directly instead of going through the setter
method.

**`freeze()`/`isFrozen()` didn't exist at all post-swap** - hand-written-only, living in files the
swap overwrites (`EClassImpl`/`EEnumImpl`/`EPackageImpl`, each with its own hardcoded cascade to
specific "own children"). Rather than restore that per-class shape, implemented a single, generic
version on `EObjectImpl` (the one file the swap never touches): cascades reflectively through
`eClass().getEAllContainments()`, genuinely more complete than the old hardcoded lists (catches
every containment reference, not just the ones each override happened to name) and cascades
transitively for free.

**`getERawType()`'s own tests were testing hand-written core's old, simplified stand-in** (no bounds
modeled, honestly `undefined`) rather than the swapped-in generated version's real, more complete
behavior (falls back through bounds to `EJavaObject`, matching point 5's own design and real EMF's
erasure semantics). Updated the tests to reflect the improvement rather than treating it as a
regression.

**`EList` vs plain array**: many pre-swap tests asserted against `EList`-returning methods with
`.toEqual([...])`, `.toContain`, `.filter`, `.length` etc. directly - all needing a spread (`[...x]`)
first now that these genuinely return `EList`, not arrays with those exact array prototype methods.
Mechanical, fixed throughout wherever found.

### What "point 6, done" turned out to still need

Point 6 had confirmed the bootstrap-ordering mitigation _works_; point 7 is where it actually got
_applied_, for real, everywhere it was needed - including two places (the earlier-than-expected
`ecore-meta-schema.ts` need, and the loader's own `addLiteral()`/`eOpposite`-wiring assumptions) that
weren't visible until the swap was actually attempted rather than diagnosed in a scratch copy.

## Notification/Adapter mechanism - DONE

Real EMF's `Notifier`/`Adapter`/`Notification` framework, adapted to TypeScript conventions rather
than ported literally - the deferred "Notification/Adapter layer" item from this project's original
roadmap, finally built, motivated by the reflective instance editor's write-path design (relaying
webview edits back to the real objects) rather than undo/redo directly, though it now unblocks that
too.

**Design departures from Java, each deliberate:**

- `EObject.onDidChange(listener, feature?)` returns a `Disposable` - not a ported 4-method `Adapter`
  interface (`getTarget`/`setTarget`/`isAdapterForType`/`notifyChanged`). That shape exists largely
  because Java, when EMF was designed, had no first-class closures; this project already uses the
  callback-based alternative throughout (`vscode.EventEmitter<T>`/`Event<T>` in `vscode-runtime` and
  `instance-editor`).
- Filtering (by feature) happens once, inside `EObjectImpl`'s own dispatch, not duplicated inside
  every listener body - real EMF's `isAdapterForType` serves a related but distinct purpose (finding
  an already-attached adapter of a given kind), not delivery filtering, and isn't ported.
- `Notification` is a plain `readonly`-property record, not method-based (`getEventType()` etc.) -
  unlike `EObject`/`EClass`/`EStructuralFeature` (the reflective metamodel types, method-based
  throughout), a `Notification` isn't itself reflective, closer in spirit to VS Code's own event
  objects than to this project's metamodel types.
- Kept: `eDeliver()`/`eSetDeliver()` (genuinely useful - bulk operations like the loader want to
  suppress a flood of individual notifications during construction), `wasSet` (needed to correctly
  reverse an `eUnset()` later). Dropped: Java's primitive-typed value accessors (no boxing concern in
  TS - `oldValue`/`newValue: unknown` already matches `eGet`/`eSet`), `isTouch()`/`isReset()` (niche,
  not needed by either motivating use case), `REMOVING_ADAPTER` (meaningless with no ported Adapter).

**Where it's wired in**: NOT derived from `eDidAdd`/`eDidRemove` - a single logical `eSet` fires those
twice (remove-old, add-new), which would produce two notifications instead of the one `SET` (carrying
both `oldValue`/`newValue` together) the design calls for. `eNotify()` is instead called directly from
every real mutation site: the `eSet`/`eUnset` default dance (both hand-written in
`DynamicEObjectImpl.ts` and the generated template), `BasicEList.onAdded`/`onRemoved` (ADD/REMOVE,
with real position tracking, threaded through `add`/`addAt`/`remove`/`removeAt`/`clear`), and each of
the three custom setter bodies in the model (`literal`, `eType`, `eGenericType`). `eGenericType`'s
setter fires _two_ notifications - one for itself, one for the `eType` it side-effects - found to be
necessary while implementing it, not designed in speculatively.

**New foundational type**: `Disposable` (`{ dispose(): void }`) in `metamodel/types/` - deliberately
NOT imported from `vscode` (this package has no such dependency, here or anywhere) - a `Disposable`
this package returns is still structurally usable anywhere `vscode.Disposable` is expected, with no
explicit conversion, since TypeScript's structural typing doesn't care which file declared the shape.

**A real bug found and fixed while testing, not predicted**: an early version of the test suite used
`toMatchObject`/`toEqual` with a real `EObject` (a circular graph - `eContainer`/opposite references)
embedded inside the matcher, which caused a genuine timeout (>300s) - almost certainly a pathological
deep-comparison over the cycle. Fixed by asserting `EObject`-valued notification fields (`notifier`,
`feature`, object-valued `oldValue`/`newValue`) with `.toBe()` identity checks, never embedded in a
structural matcher.

**A real checker-infrastructure gap found and fixed**: `check_ecore.py`'s verification environment is
built from a stale `workspace.zip` snapshot, patched with a short list of hand-written files that have
since diverged (previously just `EObjectImpl.ts`). The new/changed files this work touched
(`Disposable.ts`, `Notification.ts`, `EObject.ts`, `BasicEList.ts`, `DynamicEObjectImpl.ts`) weren't in
that list, and the existing copy logic only knew how to place files into `impl/` by basename - a
`types/`-located file would have silently landed in the wrong directory. Both the patch list and the
copy logic (now respects each file's real subdirectory) were fixed.

Full monorepo: 515/515 tests passing (core 153, generator 298, json 14, xmi 25, node 9,
vscode-runtime 13, instance-editor 3) - all rebuilt and reverified together, not just core in
isolation.
