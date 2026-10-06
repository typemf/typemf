---
'@typemf/core': patch
---

Fix `EClassifier.isInstance(object)`, which previously returned `object instanceof EObjectImpl` for every classifier - `true` for any EObject regardless of its actual class, `false` for every data value (e.g. `EString.isInstance('text')` was `false`).

`EClass.isInstance(object)` now checks `object` is an `EObject` whose class this class is a supertype of (`isSuperTypeOf`). `EDataType.isInstance(object)` checks `object`'s TypeScript type against the data type's known built-in Ecore name (`EString`, `EInt`/`ELong`/`EDouble`/`EFloat`/`EShort`/`EByte` and their `*Object` forms, `EBigInteger`, `EBoolean`/`EBooleanObject`, `EDate`); a custom data type with no special-cased name accepts any defined value, matching EMF's own permissive default for a type with no known Java class.
