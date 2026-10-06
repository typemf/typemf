---
'@typemf/core': minor
'@typemf/generator': patch
---

Fix every generated package (including `@typemf/core`'s own self-hosted Ecore metamodel) requiring `{Pkg}PackageImpl.eINSTANCE`/`.init()` to be touched before anything else could be used (CORE-01) - `new EClassImpl().setName('Book')`, or any other direct construction of a generated class, previously threw `getEcorePackageRef() called before the EcorePackage singleton finished constructing itself.`

The package singleton is now constructed lazily, on first use, through an initializer each `{Pkg}PackageImpl.ts` registers as a side effect of its own module being loaded - no code anywhere needs to explicitly reference `eINSTANCE` first just to make the metamodel exist. `@typemf/core`'s `package.json` is now marked `"sideEffects": true` so a bundler doesn't tree-shake that registration away.

Also adds `{Factory}Impl.eINSTANCE` (e.g. `EcoreFactoryImpl.eINSTANCE`), matching EMF's own factory singleton accessor alongside the package's.
