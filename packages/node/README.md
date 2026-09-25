# @typemf/node

The `fs`-backed `UriConverter` for the `"file"` URI scheme - the Node-only piece
deliberately kept out of `@typemf/core` so nothing shipping to a browser bundle ever
pulls in Node's `fs` module, and so a browser/webview consumer using only an in-memory
or `fetch()`-based converter never needs this package at all.

## Usage

```ts
import { ResourceSetImpl, URI } from '@typemf/core';
import { registerXmiFormat } from '@typemf/xmi';
import { NodeFileUriConverter } from '@typemf/node';

const resourceSet = new ResourceSetImpl();
resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());
registerXmiFormat(resourceSet.getResourceFactoryRegistry());

const resource = await resourceSet.getResource(URI.createFileURI('/path/to/model.xmi'), true);
```

Registered into a `UriConverterRegistry`, not set as a single slot - a `ResourceSet` can
hold this alongside a converter for another scheme (an `https://` one, say) at the same
time; see `@typemf/core`'s `NOTES.md` for why that's a registry rather than a single
slot.

## What it does

- `writeBinary()` creates any missing intermediate directories first (`mkdir -p`
  semantics), so saving to a not-yet-existing directory tree just works.
- A URI's fragment (if any) is ignored when resolving the filesystem path - a
  `Resource`'s own URI never carries one in normal use, but this makes the converter
  robust regardless.
- Only handles the `"file"` scheme; `canHandle()` returns `false` for everything else,
  so it coexists cleanly with other converters in the same registry.

## Why this package exists before @typemf/generator

Every test across `@typemf/core`, `@typemf/json`, and `@typemf/xmi` up to this point
round-tripped through an in-memory `UriConverter` fixture - none of them ever touched
an actual file. `end-to-end.test.ts` here writes a real `.xmi` file to a real temporary
directory and reads it back with Node's own `fs` module directly (bypassing this
package's own converter), asserting on the literal bytes - the closest available check
that `@typemf/xmi`'s EMF-compatibility claims hold up outside an in-memory test double,
short of opening the file in an actual Eclipse instance.
