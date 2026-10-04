import { URI } from './uri.js';
import { UriConverter } from './uri-converter.js';

/**
 * "Which UriConverter handles this URI?" - the same shape as
 * ResourceFactoryRegistry (register, then dispatch by inspecting the URI),
 * applied one level lower: ResourceFactoryRegistry picks a *format* by
 * extension; this picks a *transport* by scheme, via each converter's own
 * canHandle(). Replaces a single settable UriConverter slot on ResourceSet,
 * which could only ever handle one scheme at a time - e.g. a local
 * `file://` document that cross-references an object at an `https://` URL
 * needs two converters coexisting in the same ResourceSet, not one.
 */
export interface UriConverterRegistry {
  register(converter: UriConverter): void;
  unregister(converter: UriConverter): void;

  /** The first registered converter whose canHandle(uri) is true, if any. */
  getConverter(uri: URI): UriConverter | undefined;

  getConverters(): UriConverter[];
}
