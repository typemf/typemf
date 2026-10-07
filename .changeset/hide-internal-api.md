---
'@typemf/core': minor
'@typemf/generator': minor
---

Hide internals from the published API. Core's type declarations no longer contain members that only core itself uses: `associateRoot`/`dissociateRoot`, `Resource.eSetResourceSet()`, `BasicEList.basicAdd()`/`basicRemove()`, and `EObjectImpl.eInverseAdd()`/`eInverseRemove()`/`eBasicSetContainer()`/`eSetDirectResource()`/`eSetProxy()`/`eBasicDetachFromContainer()`, as well as the bootstrap-only `eBootstrapList()` of the metamodel classes. Generated classes no longer get an `eBootstrapList()` method, except when generating Ecore itself. Members that generated code calls (`eDidAdd`, `eDidRemove`, `eNotify`, `eBasicSetValue`, `getModelGeneration`, the ID setters) stay public and are documented as such. To add a resource to a resource set, use `ResourceSet.createResource()`.
