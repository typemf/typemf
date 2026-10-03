# @typemf/node

File system access for [`@typemf/core`](https://www.npmjs.com/package/@typemf/core) in Node.js: a
URI converter for `file:` URIs. It is a separate package so that `@typemf/core` does not depend
on Node.js and runs in the browser.

## Installation

```bash
npm install @typemf/core @typemf/node
```

## Usage

```ts
import { ResourceSetImpl, URI } from '@typemf/core';
import { NodeFileUriConverter } from '@typemf/node';
import { registerXmiFormat } from '@typemf/xmi';

const resourceSet = new ResourceSetImpl();
resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());
registerXmiFormat(resourceSet.getResourceFactoryRegistry());

const resource = await resourceSet.getResource(URI.createFileURI('/path/to/model.xmi'), true);
```

The converter handles only `file:` URIs, so it can be registered alongside converters for other
schemes. Saving creates missing parent directories.

## License

Apache-2.0
