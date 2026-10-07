import { URI } from './uri.js';

/**
 * Reads and writes the bytes behind a URI. Core contains no implementation; `@typemf/node`
 * provides one for `file:` URIs, and other environments supply their own.
 */
export interface UriConverter {
  /** Whether this converter knows how to handle `uri` (typically by scheme). */
  canHandle(uri: URI): boolean;

  /** The bytes stored at `uri`. */
  readBinary(uri: URI): Promise<Uint8Array>;

  /** Stores `content` at `uri`, replacing what was there. */
  writeBinary(uri: URI, content: Uint8Array): Promise<void>;

  /** Whether something is stored at `uri`. */
  exists(uri: URI): Promise<boolean>;
}
