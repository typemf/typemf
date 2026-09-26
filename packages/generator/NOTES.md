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
`@typemf/core`: generated classifier files sit as **plain siblings** in the *same* `types/`/
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
JS/TS class *is* its own constructor function - the same "reference to the class itself, not an
instance of it" relationship `Class<T>` has in Java:

```ts
type JavaClass<T = unknown> = new (...args: any[]) => T;
```

Parameterized where the specific type is known (`JavaClass<Book>`); falls back to the
unparameterized `JavaClass` (i.e. `JavaClass<unknown>`) for the bare-`EDataType` case, which is
how `EJavaClass` is actually used today (registered generically in the meta-schema, no type
argument attached).

**Worth remembering when this is implemented:** if `EJavaClass` ever needs to represent an
*abstract* Java class, `new (...args) => T` is too strict (abstract classes can't be
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
list to drop any name that's also a real classifier in this package, since whichever *other*
import already brings that name into scope (the classifier's own self-import, a
`referencedApiTypes()` entry, or a `concreteEClassesOf()`/`eClassesOf()` loop) is - in every such
case - a real classifier of this exact package, so nothing is actually lost by not
double-importing it. Emits nothing at all (not an empty `import {}`) if every requested name
collided. Wired into `eclass.njk` (both files) and `efactory.njk` (both files); `epackage.njk`,
`eswitch.njk`, and `etypeguards.njk` don't need it - confirmed they have no second import line
that could ever bring the same core name back in.

A third, distinct instance of the same underlying pattern was found and fixed separately:
`EcoreFactoryImpl.ts`'s own `EFactory`-unification special case (`import { EFactoryImpl } from
'./EFactoryImpl.js'`) collided with its *own* `concreteEClassesOf()`-based classifier-impl loop,
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
`EModelElement.getEAnnotation(source: string): EAnnotation | undefined` (the *reflective*
"look up an attached annotation by source URI" operation). Both are named `getEAnnotation`;
TypeScript correctly rejects the interface as incompatible.

This is NOT the same bug as the import-collision issue - it's a method name colliding with an
*inherited operation name*, not two imports of the same symbol. The general shape: **any real
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
