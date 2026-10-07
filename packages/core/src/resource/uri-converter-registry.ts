import { URI } from './uri.js';
import { UriConverter } from './uri-converter.js';

/** The converters a resource set can read and write through, one per kind of URI. */
export interface UriConverterRegistry {
  register(converter: UriConverter): void;
  unregister(converter: UriConverter): void;

  /** The first registered converter whose canHandle(uri) is true, if any. */
  getConverter(uri: URI): UriConverter | undefined;

  /** A copy of the registered converters, in registration order. */
  getConverters(): UriConverter[];
}
