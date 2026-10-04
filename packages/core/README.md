# @typemf/core

The Ecore metamodel and runtime of TypeMF, the TypeScript port of the
[Eclipse Modeling Framework](https://eclipse.dev/emf/) (EMF).

- The Ecore metamodel: `EPackage`, `EClass`, `EAttribute`, `EReference`, `EEnum`, `EDataType`,
  `EOperation`, `EAnnotation`, generics, and the `EcorePackage`/`EcoreFactory` singletons.
- `EObject` with reflective access (`eGet`, `eSet`, `eIsSet`, `eUnset`), containment
  (`eContainer`, `eContents`, `eAllContents`) and change notifications (`onDidChange`).
- Dynamic objects: `DynamicEFactoryImpl` creates instances of any `EClass` without generated code.
- Resources: `ResourceSet`, `Resource`, `URI`, proxies for cross-document references, and the
  registries for packages, resource factories and URI converters.

Model code is generated with `@typemf/generator`. Serialization formats are in `@typemf/xmi` and
`@typemf/json`, file access in Node.js in `@typemf/node`.

## Installation

```bash
npm install @typemf/core
```

## Example

Build a metamodel with the Ecore factory and create an instance of it reflectively:

```ts
import { DynamicEFactoryImpl, EcorePackageImpl } from '@typemf/core';

const ecore = EcorePackageImpl.eINSTANCE;
const factory = ecore.getEFactoryInstance();

const pkg = factory.createEPackage();
pkg.setName('library');
pkg.setNsURI('https://example.org/library');
pkg.setNsPrefix('library');
pkg.setEFactoryInstance(new DynamicEFactoryImpl());

const book = factory.createEClass();
book.setName('Book');
const title = factory.createEAttribute();
title.setName('title');
title.setEType(ecore.getEString());
book.getEStructuralFeatures().add(title);
pkg.getEClassifiers().add(book);

const dune = pkg.getEFactoryInstance().create(book);
dune.eSet(title, 'Dune');
dune.eGet(title); // 'Dune'
```

`EcorePackageImpl.eINSTANCE` must be accessed before any other Ecore object is created; it
initializes the Ecore metamodel.

## Loading and saving

A `ResourceSet` needs a URI converter for the URI scheme and a resource factory for the file
extension:

```ts
import { ResourceSetImpl, URI } from '@typemf/core';
import { NodeFileUriConverter } from '@typemf/node';
import { registerXmiFormat } from '@typemf/xmi';

const resourceSet = new ResourceSetImpl();
resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());
registerXmiFormat(resourceSet.getResourceFactoryRegistry());
resourceSet.getPackageRegistry().register(pkg);

const resource = await resourceSet.getResource(URI.createFileURI('/path/to/library.xmi'), true);
resource.getContents(); // root objects
await resource.save();
```

## Limitations

- `EMap` is not supported.

## License

Apache-2.0
