import { URI, UriConverter } from "@typemf/core";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

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
    return uri.getScheme() === "file";
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

  private pathFor(uri: URI): string {
    if (uri.getScheme() !== "file") {
      throw new Error(
        `NodeFileUriConverter cannot handle scheme '${uri.getScheme()}' (only 'file').`,
      );
    }
    return uri.trimFragment().getPath();
  }
}
