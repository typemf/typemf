import { URI, UriConverter } from '@typemf/core';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The Node-only, fs-backed UriConverter discussed back when @typemf/core's
 * resource/ layer was designed: it exists as its own package specifically
 * so that nothing shipping to a browser bundle ever pulls in Node's `fs`
 * module, and so a consumer wanting only the in-memory or a fetch()-based
 * converter never needs this one at all.
 *
 * Handles the "file" URI scheme only. Register it into a ResourceSet's
 * UriConverterRegistry alongside any other converter for other schemes -
 * see the "browser could load an https:// XMI file without fs access"
 * discussion for why this is a registry rather than a single slot.
 */
export class NodeFileUriConverter implements UriConverter {
  canHandle(uri: URI): boolean {
    return uri.getScheme() === 'file';
  }

  async readBinary(uri: URI): Promise<Uint8Array> {
    const path = this.pathFor(uri);
    const buffer = await readFile(path);
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }

  async writeBinary(uri: URI, content: Uint8Array): Promise<void> {
    const path = this.pathFor(uri);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
  }

  async exists(uri: URI): Promise<boolean> {
    try {
      await access(this.pathFor(uri));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * A URI's own `getPath()` is unusable directly as a filesystem path on every
   * platform/caller combination - a URI built from a Windows `fsPath` ("c:\Users\...") has a
   * `path` of "/c:\Users\..." (createFileURI only ever prepends "/"; it doesn't know about drive
   * letters or backslashes), and a URI parsed from real "file:" text keeps its percent-encoding
   * ("a%20b") rather than decoding it. `fileURLToPath` is Node's own, already-correct, per-platform
   * answer to exactly this problem - it treats backslashes as path separators (the WHATWG URL
   * parser does this for every "special" scheme, "file" included) and decodes percent-escapes -
   * so this converts through it instead of reading `getPath()` by hand.
   */
  private pathFor(uri: URI): string {
    if (uri.getScheme() !== 'file') {
      throw new Error(`NodeFileUriConverter cannot handle scheme '${uri.getScheme()}' (only 'file').`);
    }
    return fileURLToPath(uri.trimFragment().toString());
  }
}
