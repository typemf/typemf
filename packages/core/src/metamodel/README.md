# Generated Ecore package - regenerated from the updated Ecore.ecore file

47 files, generated with `generate({ 'generate-ecore': true })` against the updated `Ecore.ecore`
file supplied by the person. Confirmed via `diff` against the previous fixture: exactly one real
change - `EJavaObject` now carries a `typescript-type` annotation
(`source="https://typemf.dev/generator"`, `details key="typescript-type" value="unknown"`).

## What this new annotation reveals, concretely

This is the three-tier `EDataType` naming mechanism discussed earlier (read a `typescript-type`
annotation detail first, then `instanceClassName`, then the plain name) - previously scoped as
partly the person's own `@typemf/core` work, partly a not-yet-built generator-side piece. This
regeneration confirms the generator-side piece is still not built, concretely rather than
hypothetically: the annotation itself correctly survives conversion (visible directly in
`impl/EcorePackageImpl.ts`, which correctly attaches it via `getEAnnotations().add(...)`), but
`tsPrimitiveType()` has no logic reading it yet, so `EJavaObject` is emitted as a bare, unresolved
nominal type (`EJavaObject | undefined`, etc.) in over 20 places across this output
(`EClassifier.defaultValue`, `EFactory.createFromString`/`convertToString`, ...) instead of
resolving to `unknown` as the annotation now explicitly requests.

## Everything else, unchanged from the previous delivery

- Operation return types respect real declared multiplicity (`EModelElement.getEAnnotation(source):
  EAnnotation | undefined` correct; `isSuperTypeOf()`/`getClassifierID()` correctly non-optional).
- Zero duplicate imports (confirmed via mechanical scan across this regeneration too).
- The `getEAnnotation()` **method-name** collision in `EcorePackage` is still open, still not
  fixed - this output will not compile as-is if merged into `@typemf/core` until that's resolved.

## Layout

```
EcorePackage.ts / EcoreFactory.ts       interfaces, root
index.ts                                re-exports the two files above
impl/{Name}Impl.ts                      every classifier's fully-generated concrete class
impl/EcorePackageImpl.ts                package singleton construction
impl/EcoreFactoryImpl.ts                factory impl
impl/index.ts                           re-exports everything in impl/
types/{Name}.ts                         every classifier's interface
types/index.ts                          re-exports everything in types/
util/EcoreSwitch.ts                     visitor
util/EcoreTypeGuards.ts                 isX() reflective type guard per classifier
```

Generated to be merged into an existing `@typemf/core`, not compiled standalone - see the
generator's own `NOTES.md` for the full reasoning.
