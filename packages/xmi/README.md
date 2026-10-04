# @typemf/xmi

XMI serialization for [`@typemf/core`](https://www.npmjs.com/package/@typemf/core). It follows
EMF's default XMI conventions, so files can be exchanged with Eclipse EMF. `.ecore` files are read
and written with the same format.

## Installation

```bash
npm install @typemf/core @typemf/xmi
```

## Usage

`registerXmiFormat` registers the format for the `xmi` and `ecore` file extensions:

```ts
import { ResourceSetImpl, URI } from '@typemf/core';
import { NodeFileUriConverter } from '@typemf/node';
import { registerXmiFormat } from '@typemf/xmi';

const resourceSet = new ResourceSetImpl();
resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());
registerXmiFormat(resourceSet.getResourceFactoryRegistry());
resourceSet.getPackageRegistry().register(LibraryPackageImpl.eINSTANCE);

const resource = await resourceSet.getResource(URI.createFileURI('/path/to/library.xmi'), true);
```

The `EPackage` of every namespace used in the file must be in the package registry before loading.

## Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<library:Library xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:library="https://example.org/library" name="City Library">
  <writers name="Frank Herbert"/>
  <books title="Dune" pages="412" author="Frank Herbert"/>
</library:Library>
```

As in EMF:

- Contained objects are nested elements.
- References within the same document are attributes; references to other documents are child
  elements with an `href`.
- Objects are addressed by their ID attribute if their class has one, otherwise by position
  (`//@books.2`).
- `xsi:type` is written only when an object's class differs from the declared type of its feature.

XML is parsed with the browser's `DOMParser` where available and with
[`@xmldom/xmldom`](https://www.npmjs.com/package/@xmldom/xmldom) in Node.js.

## Limitations

- A document must have exactly one root object; the `<xmi:XMI>` wrapper for several roots is not
  supported.

## License

Apache-2.0
