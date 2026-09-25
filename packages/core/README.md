# @typemf/core

First working slice of the `typemf` rebuild: `metamodel/api` (interfaces)
and `metamodel/impl` (implementations), covering the full Ecore-equivalent
type chain (`EObject` → `EModelElement` → `ENamedElement` → `ETypedElement`
→ `EClassifier`/`EStructuralFeature` → `EClass`/`EAttribute`/`EReference`/
`EEnum`/... → `EPackage`/`EFactory`), plus the two additions agreed on
during planning:

- **`EAnnotation`** - arbitrary source-namespaced metadata on any
  `EModelElement`, which the original TMF had no equivalent of at all.
- **`DynamicEObjectImpl` / `DynamicEFactoryImpl`** - a generic, map-backed
  `EObject` that works for *any* `EClass` with zero generated code, built
  specifically so a `.ecore` file parsed at runtime (no codegen step) can be
  instantiated and edited reflectively. Containment bookkeeping
  (`eContainer`/`eContents`/`eAllContents`) is fully generic on
  `EObjectImpl` and comes "for free" to both this class and any future
  generated `*Gen` class, since it's derived entirely from `eGet`.

See `NOTES.md` for design decisions that were deliberately deferred rather
than either skipped silently or over-built prematurely (EMap, reflection
over the metamodel itself, opposite/inverse maintenance).

## Layout

```
src/
  metamodel/
    api/            interfaces only, no runtime code
    impl/           concrete classes
    __tests__/      vitest suite + a shared sample metamodel fixture
  index.ts          public entry point (barrel export)
```

## Commands

```bash
npm install
npm test          # vitest run - 25 tests, all passing
npm run typecheck # tsc --noEmit
npm run build     # typecheck + tsup (emits dist/ as ESM + CJS + .d.ts)
```

## Try it

```ts
import {
  EAttributeImpl,
  EClassImpl,
  EDataTypeImpl,
  EPackageImpl,
  DynamicEFactoryImpl,
} from '@typemf/core';

const eString = new EDataTypeImpl();
eString.setName('EString');

const bookClass = new EClassImpl();
bookClass.setName('Book');

const titleAttr = new EAttributeImpl();
titleAttr.setName('title');
titleAttr.setEType(eString);
titleAttr.setID(true);
titleAttr.setFeatureID(0);
titleAttr.setEContainingClass(bookClass);
bookClass.getEStructuralFeatures().add(titleAttr);
bookClass.recomputeAllLists();

const pkg = new EPackageImpl();
pkg.setName('library');
pkg.getEClassifiers().add(bookClass);
bookClass.setEPackage(pkg);

// This is the line EcoreParser will eventually do automatically for a
// purely parsed (no generated code) package.
pkg.setEFactoryInstance(new DynamicEFactoryImpl());

const book = bookClass.createInstance(); // -> a DynamicEObjectImpl
book.eSet(titleAttr, 'Dune');
console.log(book.eGet(titleAttr));       // "Dune"
console.log(book.fullId());              // "Book_Dune"
```

See `src/metamodel/__tests__/sample-metamodel.ts` for a fuller example with
inheritance and containment.

## Not included yet

Only `metamodel/api` and `metamodel/impl` are built here. `ecore/` (the
XML parser discussed separately - native `DOMParser` in-browser,
`@xmldom/xmldom` in Node, one shared tree-walker), `registry/` (the
`EPackage.Registry`), and `json/` (the serializer) are the next slices.
