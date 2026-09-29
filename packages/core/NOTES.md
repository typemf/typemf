## EMap

`EAnnotation.getDetails()` is typed as a plain `Map<string, string>`, not a
general `EMap<K, V>` construct. That's the right call when values are
primitives (which is all `EAnnotation` ever needs), but it is not a general
substitute for EMF's `EMap`: a feature typed `EMap<EString, SomeEClass>`
needs its values to have a real `eContainer`, participate in opposite/
notification bookkeeping, and serialize as owned children - a bare `Map`
can't do any of that.
