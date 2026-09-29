import {
  createInstanceOf,
  EObject,
  ResourceSetImpl,
  URI,
} from '@typemf/core';
import { registerJsonFormat } from '@typemf/json';
import { registerXmiFormat } from '@typemf/xmi';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileUriConverter } from '../node-file-uri-converter.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

/**
 * The actual point of building @typemf/node before @typemf/generator: every
 * XMI/JSON test up to this point has round-tripped through an in-memory
 * UriConverter fixture, never touching a real file. This test writes an
 * honest-to-goodness .xmi file to a real path on disk, using Node's own
 * `fs` module directly (bypassing our own converter entirely) to read the
 * bytes back and assert on them - the closest this test suite can get to
 * "does this look like a file a real EMF tool produced" without an actual
 * Eclipse instance available to open it in.
 */
describe('End-to-end: a real .xmi file on a real filesystem path', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-e2e-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes a real .xmi file that matches EMF conventions, and reloads it correctly', async () => {
    const { libraryPackage, libraryClass, bookClass, audioBookClass, booksRef, titleAttr, narratorAttr } =
      buildSampleMetamodel();

    const resourceSet = new ResourceSetImpl();
    resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());
    registerXmiFormat(resourceSet.getResourceFactoryRegistry());
    resourceSet.getPackageRegistry().register(libraryPackage);

    const filePath = join(dir, 'library.xmi');
    const uri = URI.createFileURI(filePath);
    const resource = resourceSet.createResource(uri);

    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    const audioBook = createInstanceOf(audioBookClass);
    audioBook.eSet(titleAttr, 'Foundation');
    audioBook.eSet(narratorAttr, 'Scott Brick');
    (library.eGet(booksRef) as { add(v: EObject): void }).add(book);
    (library.eGet(booksRef) as { add(v: EObject): void }).add(audioBook);
    resource.getContents().add(library);

    await resource.save();

    const rawFile = await readFile(filePath, 'utf-8');

    expect(rawFile).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(rawFile).toContain('xmi:version="2.0"');
    expect(rawFile).toContain('xmlns:xmi="http://www.omg.org/XMI"');
    expect(rawFile).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
    expect(rawFile).toContain('xmlns:lib="https://typemf.dev/samples/library"');
    expect(rawFile).toContain('<lib:Library');
    expect(rawFile).toContain('<books title="Dune"/>');
    expect(rawFile).toContain('<books xsi:type="lib:AudioBook" title="Foundation" narrator="Scott Brick"/>');
    expect(rawFile).not.toContain('xmi:id');

    const freshSet = new ResourceSetImpl();
    freshSet.getUriConverterRegistry().register(new NodeFileUriConverter());
    registerXmiFormat(freshSet.getResourceFactoryRegistry());
    freshSet.getPackageRegistry().register(libraryPackage);

    const reloaded = await freshSet.getResource(uri, true);
    const reloadedLibrary = reloaded!.getContents().get(0);
    const reloadedBooks = [...(reloadedLibrary.eGet(booksRef) as Iterable<EObject>)];
    expect(reloadedBooks).toHaveLength(2);
    expect(reloadedBooks[0]!.eGet(titleAttr)).toBe('Dune');
    expect(reloadedBooks[1]!.eClass()).toBe(audioBookClass);
    expect(reloadedBooks[1]!.eGet(narratorAttr)).toBe('Scott Brick');
  });

  it('supports both .json and .xmi files in the same real directory, referencing each other', async () => {
    const { libraryPackage, libraryClass, bookClass, booksRef, featuredBookRef, titleAttr } = buildSampleMetamodel();

    const resourceSet = new ResourceSetImpl();
    resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());
    registerXmiFormat(resourceSet.getResourceFactoryRegistry());
    registerJsonFormat(resourceSet.getResourceFactoryRegistry());
    resourceSet.getPackageRegistry().register(libraryPackage);

    const xmiPath = join(dir, 'catalog.xmi');
    const xmiResource = resourceSet.createResource(URI.createFileURI(xmiPath));
    const xmiLibrary = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (xmiLibrary.eGet(booksRef) as { add(v: EObject): void }).add(book);
    xmiResource.getContents().add(xmiLibrary);
    await xmiResource.save();

    const jsonPath = join(dir, 'featured.json');
    const jsonResource = resourceSet.createResource(URI.createFileURI(jsonPath));
    const jsonLibrary = createInstanceOf(libraryClass);
    jsonLibrary.eSet(featuredBookRef, book);
    jsonResource.getContents().add(jsonLibrary);
    await jsonResource.save();

    const xmiBytes = await readFile(xmiPath, 'utf-8');
    const jsonBytes = await readFile(jsonPath, 'utf-8');
    expect(xmiBytes).toContain('<lib:Library');
    expect(JSON.parse(jsonBytes).$roots[0].featuredBook.$ref).toContain('catalog.xmi#');

    const freshSet = new ResourceSetImpl();
    freshSet.getUriConverterRegistry().register(new NodeFileUriConverter());
    registerXmiFormat(freshSet.getResourceFactoryRegistry());
    registerJsonFormat(freshSet.getResourceFactoryRegistry());
    freshSet.getPackageRegistry().register(libraryPackage);

    const loadedJson = await freshSet.getResource(URI.createFileURI(jsonPath), true);
    const proxy = loadedJson!.getContents().get(0).eGet(featuredBookRef) as EObject;
    const resolved = await freshSet.resolve(proxy);
    expect(resolved.eGet(titleAttr)).toBe('Dune');
  });
});
