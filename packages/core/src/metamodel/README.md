# Generated Ecore package - self-hosting version, current state

47 files, generated with `generate({ 'generate-ecore': true })` against the real `Ecore.ecore`
file. Every `@typemf/core` import is a relative path, matching the person's own already-integrated
`@typemf/core` structure (generated classifier files as plain siblings in the same `types/`/
`impl/`/`util/` folders as the hand-written foundational classes).

## What's fixed since the last delivery

**Operation return types now respect the operation's own declared multiplicity.** Real
`Ecore.ecore`'s `EModelElement.getEAnnotation(source)` declares no `lowerBound` (real EMF's
default there is 0 - not required), meaning the operation is genuinely allowed to return nothing.
Two real, distinct gaps were involved: the conversion step never copied `lowerBound`/`upperBound`
for operations or their parameters at all, and the template never consulted this information even
where it existed (it always emitted the bare, non-optional return type). Both fixed. Confirmed
directly in this output: `EModelElement.getEAnnotation(source: string): EAnnotation | undefined`
in both `types/EModelElement.ts` and `impl/EModelElementImpl.ts`, while genuinely never-null,
primitive-typed operations (`EClass.isSuperTypeOf(): boolean`, `EClassifier.getClassifierID():
number`) correctly remain non-optional regardless of their own declared multiplicity - the same
"real Java primitive, never null" short-circuit already used for structural features, now also
applied consistently to operations.

**The duplicate-import bug (real classifiers literally named `EClass`/`EStructuralFeature`/
`EFactory` colliding with `@typemf/core`'s own foundational symbol names) is fixed and confirmed**
- a mechanical scan of every file in this output for duplicate imported names finds zero.

## A genuinely different, separate problem - found, not fixed, stated plainly

`EcorePackage.ts` still declares `getEAnnotation(): EClass` - the per-classifier metamodel
accessor generated for every `EClass`-kind classifier, which fires for "EAnnotation" since it's a
real classifier here - alongside the inherited `EModelElement.getEAnnotation(source):
EAnnotation | undefined` (the reflective "look up an attached annotation" operation). This is a
**method-name** collision, not an import one, and TypeScript will reject the interface as
currently declared unless `EcorePackage` explicitly restates the full, exact overload set
matching `EModelElement`'s real signature. Not fixed here - real, tracked, needs its own decision
(restate as an overload set vs. rename the colliding metaclass accessor) before implementing. See
`NOTES.md` for the full analysis, including a verified, minimal reproduction of both the failure
and the working overload shape.

## Important: this output cannot be compiled in isolation - by design

Generated to be **merged into** an existing `@typemf/core`, not compiled standalone.
`types/index.ts`/`impl/index.ts` only re-export the ~19 classifier files above - the hand-written
foundational classes (`EObject`, `EList`, `EObjectImpl`, `BasicEList`, `DynamicEObjectImpl`, ...)
are expected to already exist in the target `@typemf/core` tree and be re-exported by its own,
separately-maintained index files. Compiling this folder alone will show "module has no exported
member" errors for exactly those foundational names - expected, not a defect in this output.

## Layout

```
EcorePackage.ts / EcoreFactory.ts       interfaces, root
index.ts                                re-exports the two files above
impl/{Name}Impl.ts                      every classifier's fully-generated concrete class
impl/EcorePackageImpl.ts                package singleton construction (explicit init()/eINSTANCE)
impl/EcoreFactoryImpl.ts                factory impl
impl/index.ts                           re-exports everything in impl/
types/{Name}.ts                         every classifier's interface
types/index.ts                          re-exports everything in types/
util/EcoreSwitch.ts                     visitor, correct supertype-fallthrough dispatch
util/EcoreTypeGuards.ts                 isX() reflective type guard per classifier
```

## Still open, by explicit decision or genuine, tracked gaps - see the generator's own NOTES.md

- The `getEAnnotation()` method-name collision above.
- `instanceClassName`-based `EDataType` naming - waiting on a `@typemf/core` addition the person
  is making themselves.
- `abstract class` instead of `interface` for `types/{Name}.ts` (real prototype-chain
  `instanceof`) - postponed. `util/EcoreTypeGuards.ts` provides a working alternative that doesn't
  depend on this decision either way.
- `EJavaClass`'s TypeScript mapping - decided in discussion, not yet implemented.
- `defaultValueLiteral` baking, and the ~14 traversal-based derived features on the *generated*
  `EClass` (present as ordinary stored fields) - both still not done.
