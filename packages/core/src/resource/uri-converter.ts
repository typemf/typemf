import { URI } from './uri.js';

/**
 * Reads/writes the raw bytes behind a URI. This is the seam we discussed
 * for keeping @typemf/core isomorphic: only the interface lives here. The
 * `fs`-backed implementation is a separate, Node-only package
 * (@typemf/node), never a runtime dependency of core itself. A browser or
 * webview consumer supplies its own implementation (backed by `fetch`, a
 * virtual filesystem, VSCode's own FS API, etc).
 *
 * Deliberately byte-oriented (Uint8Array), not string-oriented, matching
 * EMF's stream-based Resource I/O - text encoding/decoding is a concern of
 * the EObjectSerializer for a given format, not of the converter.
 */
export interface UriConverter {
  /** Whether this converter knows how to handle `uri` (typically by scheme). */
  canHandle(uri: URI): boolean;

  readBinary(uri: URI): Promise<Uint8Array>;
  writeBinary(uri: URI, content: Uint8Array): Promise<void>;
  exists(uri: URI): Promise<boolean>;
}
