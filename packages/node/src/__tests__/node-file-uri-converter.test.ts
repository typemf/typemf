import { URI } from '@typemf/core';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileUriConverter } from '../node-file-uri-converter.js';

describe('NodeFileUriConverter', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-node-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('canHandle is true only for the "file" scheme', () => {
    const converter = new NodeFileUriConverter();
    expect(converter.canHandle(URI.parse('file:///tmp/model.xmi'))).toBe(true);
    expect(converter.canHandle(URI.parse('https://typemf.dev/model.xmi'))).toBe(false);
    expect(converter.canHandle(URI.parse('mem:model'))).toBe(false);
  });

  it('writes and reads a file', async () => {
    const converter = new NodeFileUriConverter();
    const uri = URI.createFileURI(join(dir, 'model.txt'));
    const content = new TextEncoder().encode('hello from a real file');

    await converter.writeBinary(uri, content);
    const readBack = await converter.readBinary(uri);

    expect(new TextDecoder().decode(readBack)).toBe('hello from a real file');
  });

  it('creates intermediate directories on write, like mkdir -p', async () => {
    const converter = new NodeFileUriConverter();
    const uri = URI.createFileURI(join(dir, 'nested', 'deeper', 'model.txt'));

    await converter.writeBinary(uri, new TextEncoder().encode('nested content'));
    const readBack = await converter.readBinary(uri);

    expect(new TextDecoder().decode(readBack)).toBe('nested content');
  });

  it('exists() reports whether the file exists', async () => {
    const converter = new NodeFileUriConverter();
    const uri = URI.createFileURI(join(dir, 'maybe.txt'));

    expect(await converter.exists(uri)).toBe(false);
    await converter.writeBinary(uri, new TextEncoder().encode('now it does'));
    expect(await converter.exists(uri)).toBe(true);
  });

  it('ignores the URI fragment', async () => {
    const converter = new NodeFileUriConverter();
    const baseUri = URI.createFileURI(join(dir, 'model.txt'));
    await converter.writeBinary(baseUri, new TextEncoder().encode('base content'));

    const withFragment = baseUri.withFragment('Book_Dune');
    const readBack = await converter.readBinary(withFragment);
    expect(new TextDecoder().decode(readBack)).toBe('base content');
  });

  it('throws for a non-file scheme', async () => {
    const converter = new NodeFileUriConverter();
    await expect(converter.readBinary(URI.parse('mem:whatever'))).rejects.toThrow(/cannot handle scheme 'mem'/);
  });

  it('readBinary throws for a file that does not exist', async () => {
    const converter = new NodeFileUriConverter();
    const uri = URI.createFileURI(join(dir, 'does-not-exist.txt'));
    await expect(converter.readBinary(uri)).rejects.toThrow();
  });

  describe('paths that are not a plain, already-decoded POSIX path', () => {
    it('decodes a percent-encoded path (a URI parsed from real "file:" text keeps its escapes)', async () => {
      const converter = new NodeFileUriConverter();
      const realPath = join(dir, 'a b.txt');
      await converter.writeBinary(URI.createFileURI(realPath), new TextEncoder().encode('percent-encoded'));

      const encodedUri = URI.parse(`file://${join(dir, 'a%20b.txt')}`);
      const readBack = await converter.readBinary(encodedUri);
      expect(new TextDecoder().decode(readBack)).toBe('percent-encoded');
    });

    it('treats a backslash in the path as a separator, like a Windows fsPath URI would have', async () => {
      // createFileURI itself now normalizes backslashes - this instead covers a URI
      // built some other way, e.g. URI.parse() on raw text that still has them (real "file:" URIs
      // never do, but nothing stops a caller from handing one over anyway). Simulated here (this
      // suite also runs on POSIX) by writing through a forward-slash URI and reading back through
      // an otherwise-identical one with backslashes in place of the later separators;
      // fileURLToPath treats both the same way, on every platform (WHATWG URL's own "special
      // scheme" rule).
      const converter = new NodeFileUriConverter();
      const realPath = join(dir, 'nested', 'model.txt');
      await converter.writeBinary(URI.createFileURI(realPath), new TextEncoder().encode('backslash-separated'));

      const backslashUri = URI.parse(`file://${dir}\\nested\\model.txt`);
      const readBack = await converter.readBinary(backslashUri);
      expect(new TextDecoder().decode(readBack)).toBe('backslash-separated');
    });
  });
});
