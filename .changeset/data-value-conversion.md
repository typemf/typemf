---
'@typemf/core': minor
'@typemf/generator': minor
'@typemf/json': minor
'@typemf/xmi': minor
'instance-editor': patch
---

Convert data values consistently and exactly.

- `ELong`/`ELongObject` and `EBigInteger` values are now `bigint`, so 64-bit values no longer lose precision above 2^53; `EBigDecimal` values are strings holding the exact decimal; `EDate` values are `Date` and `EByteArray` values are `Uint8Array` (hexadecimal in documents). Generated types change accordingly. **Breaking:** code that reads or writes an `ELong` attribute now uses `bigint`.
- `EFactory.createFromString()` throws for a literal that is not a valid value of the data type, including out-of-range integers, instead of returning `NaN` or a rounded number. Booleans are read case-insensitively, `INF`/`-INF`/`NaN` are accepted for floating-point types, and an enum literal is checked against the enum. `convertToString()` returns `undefined` for `undefined`/`null`.
- New `createFromString(eDataType, literal)` and `convertToString(eDataType, value)` functions convert with the factory of the data type's package, as EMF's `EcoreUtil` does. XMI and JSON now use them for every attribute value, so every data type converts the same way in both formats, including custom data types with their own factory. An invalid value in a document is recorded in `getErrors()` and leaves the attribute unset instead of aborting the load or storing a wrong value. JSON writes values it cannot represent exactly (a `bigint`, `NaN`, `Infinity`, a `Date`, bytes) as strings.
- `EClassifier.getDefaultValue()` returns `0n` for `ELong` and an enum's first literal for an enum. Generated defaults are checked: an invalid `defaultValueLiteral` of a primitive attribute is a generation error.
- The instance editor edits `bigint` attributes in a text field.
