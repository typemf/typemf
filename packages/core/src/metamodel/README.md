# Generated Ecore package - self-hosting version, with the import-collision fix

47 files, generated with `generate({ 'generate-ecore': true })` against the real `Ecore.ecore`
file. Every `@typemf/core` import is a relative path, matching the person's own already-integrated
`@typemf/core` structure (generated classifier files as plain siblings in the same `types/`/
`impl/`/`util/` folders as the hand-written foundational classes).

## What changed since the last delivery

**The duplicate-import bug is fixed.** Real `Ecore.ecore` genuinely models classifiers literally
named `EClass`, `EStructuralFeature`, `EFactory`, etc. - coinciding with `@typemf/core`'s own
foundational symbol names, which is why this only ever affects self-hosted Ecore.ecore generation,
never an ordinary user metamodel. Confirmed fixed by mechanically scanning every one of these 47
files for duplicate imported names - zero found. Three distinct instances of the same underlying
pattern were involved, not just the one originally reported (`EcoreFactory.ts`): `EClassImpl.ts`,
`EOperationImpl.ts`, `EReferenceImpl.ts`, `EStructuralFeatureImpl.ts` (a classifier's own
self-import or a feature-type import colliding with the unconditional core import), and
`EcoreFactoryImpl.ts`'s own `EFactory`-unification import colliding with its classifier-impl loop.
See the generator's own `NOTES.md` for the full mechanism (`excludeCollidingCoreNames()`/
`coreImportLine()`).

## A genuinely different, separate problem - found, not fixed, stated plainly

Compiling this output for real (in isolation, without the hand-written foundational files this
mode is meant to be merged with - see below) surfaced a **method-name** collision, not an import
one: `EcorePackage.ts` declares `getEAnnotation(): EClass` - the per-classifier metamodel accessor
generated for every `EClass`-kind classifier, which fires for "EAnnotation" since it's a real
classifier here - but `EPackage` inherits `EModelElement.getEAnnotation(source): EAnnotation`, the
*reflective* "look up an attached annotation by source" operation. Both are named `getEAnnotation`;
TypeScript rejects the resulting interface as incompatible. This is real and NOT yet fixed -
deliberately not rushed in the same pass as the import fix, since it's a different kind of
collision needing its own analysis. Full details in `NOTES.md`.

## Important: this output cannot be compiled in isolation - by design

This is generated to be **merged into** an existing `@typemf/core`, not compiled standalone.
`types/index.ts`/`impl/index.ts` only re-export the ~19 classifier files above - they do not (and
should not) include the hand-written foundational classes (`EObject`, `EList`, `EObjectImpl`,
`BasicEList`, `DynamicEObjectImpl`, ...), which are expected to already exist in the target
`@typemf/core` tree and be re-exported by its own, separately-maintained index files. Compiling
this folder alone will show "module has no exported member" errors for exactly those foundational
names - that's expected, not a defect in this output.

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

- The `getEAnnotation()` method-name collision above - real, found, not yet fixed.
- `instanceClassName`-based `EDataType` naming - waiting on a `@typemf/core` addition the person
  is making themselves.
- `abstract class` instead of `interface` for `types/{Name}.ts` (real prototype-chain
  `instanceof`) - postponed. `util/EcoreTypeGuards.ts` provides a working alternative that doesn't
  depend on this decision either way.
- `EJavaClass`'s TypeScript mapping (`type JavaClass<T> = new (...args: any[]) => T`) - decided in
  discussion, not yet implemented; confirmed as the cause of unresolved `EJavaClass`/`EJavaObject`
  references in `EClassifierImpl.ts` when this output was compiled for real.
- `defaultValueLiteral` baking, and the ~14 traversal-based derived features on the *generated*
  `EClass` (present as ordinary stored fields) - both still not done.
