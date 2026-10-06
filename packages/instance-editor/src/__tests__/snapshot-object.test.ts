import {
  createInstanceOf,
  DynamicEFactoryImpl,
  EAttributeImpl,
  EcorePackageImpl,
  EClassImpl,
  EDataTypeImpl,
  EPackageImpl,
  EPackageRegistryImpl,
  EReferenceImpl,
  isENamedElement,
  ResourceSetImpl,
  URI,
} from '@typemf/core';
import { registerXmiFormat } from '@typemf/xmi';
import { NodeFileUriConverter } from '@typemf/node';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ObjectIdMap } from '../object-id-map.js';
import { snapshotObject } from '../snapshot-object.js';

void EcorePackageImpl.eINSTANCE;

function buildFixture() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');
  const eInt = new EDataTypeImpl();
  eInt.setName('EInt');

  const bookClass = new EClassImpl();
  bookClass.setName('Book');
  const titleAttr = new EAttributeImpl();
  titleAttr.setName('title');
  titleAttr.setEType(eString);
  titleAttr.setFeatureID(0);
  bookClass.getEStructuralFeatures().add(titleAttr);
  const pageCountAttr = new EAttributeImpl();
  pageCountAttr.setName('pageCount');
  pageCountAttr.setEType(eInt);
  pageCountAttr.setFeatureID(1);
  bookClass.getEStructuralFeatures().add(pageCountAttr);

  const libraryClass = new EClassImpl();
  libraryClass.setName('Library');
  const booksRef = new EReferenceImpl();
  booksRef.setName('books');
  booksRef.setEType(bookClass);
  booksRef.setContainment(true);
  booksRef.setUpperBound(-1);
  booksRef.setFeatureID(0);
  libraryClass.getEStructuralFeatures().add(booksRef);
  const featuredBookRef = new EReferenceImpl();
  featuredBookRef.setName('featuredBook');
  featuredBookRef.setEType(bookClass);
  featuredBookRef.setFeatureID(1);
  libraryClass.getEStructuralFeatures().add(featuredBookRef);

  const pkg = new EPackageImpl();
  pkg.setName('library');
  pkg.setNsURI('https://example.com/library');
  pkg.getEClassifiers().add(bookClass);
  pkg.getEClassifiers().add(libraryClass);
  // Adding a classifier to eClassifiers doesn't set its package.
  bookClass.setEPackage(pkg);
  libraryClass.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return { bookClass, libraryClass, titleAttr, pageCountAttr, booksRef, featuredBookRef };
}

describe('snapshotObject', () => {
  it("encodes single-valued attributes with @typemf/json's encoding", () => {
    const { bookClass, titleAttr, pageCountAttr } = buildFixture();
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    book.eSet(pageCountAttr, 412);

    const snapshot = snapshotObject(book, new ObjectIdMap());

    expect(snapshot.attributes.title).toBe('Dune');
    expect(snapshot.attributes.pageCount).toBe(412);
  });

  it('encodes references as ids, also for containment', () => {
    const { libraryClass, booksRef, bookClass, titleAttr } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');
    (library.eGet(booksRef) as { add(v: unknown): void }).add(book);

    const ids = new ObjectIdMap();
    const snapshot = snapshotObject(library, ids);

    expect(snapshot.references.books).toEqual([ids.idFor(book)]);
    expect(JSON.stringify(snapshot)).not.toContain('DynamicEObjectImpl');
  });

  it('encodes a single-valued reference as an id, or undefined when unset', () => {
    const { libraryClass, featuredBookRef, bookClass, titleAttr } = buildFixture();
    const library = createInstanceOf(libraryClass);
    const book = createInstanceOf(bookClass);
    book.eSet(titleAttr, 'Dune');

    const ids = new ObjectIdMap();
    expect(snapshotObject(library, ids).references.featuredBook).toBeUndefined();

    library.eSet(featuredBookRef, book);
    expect(snapshotObject(library, ids).references.featuredBook).toBe(ids.idFor(book));
  });

  it('keeps id and eClassId stable across snapshots', () => {
    const { bookClass } = buildFixture();
    const book = createInstanceOf(bookClass);
    const ids = new ObjectIdMap();

    const first = snapshotObject(book, ids);
    const second = snapshotObject(book, ids);

    expect(second.id).toBe(first.id);
    expect(second.eClassId).toBe(first.eClassId);
  });

  it('eClassId resolves to the EClass through the ObjectIdMap', () => {
    const { bookClass } = buildFixture();
    const book = createInstanceOf(bookClass);
    const ids = new ObjectIdMap();

    const snapshot = snapshotObject(book, ids);

    expect(ids.objectFor(snapshot.eClassId)).toBe(bookClass);
  });

  it('many-valued attributes encode each item', () => {
    const { bookClass } = buildFixture();
    const eString = new EDataTypeImpl();
    eString.setName('EString');
    const tagsAttr = new EAttributeImpl();
    tagsAttr.setName('tags');
    tagsAttr.setEType(eString);
    tagsAttr.setUpperBound(-1);
    tagsAttr.setFeatureID(2);
    bookClass.getEStructuralFeatures().add(tagsAttr);

    const book = createInstanceOf(bookClass);
    (book.eGet(tagsAttr) as { add(v: unknown): void }).add('sci-fi');
    (book.eGet(tagsAttr) as { add(v: unknown): void }).add('classic');

    const snapshot = snapshotObject(book, new ObjectIdMap());
    expect(snapshot.attributes.tags).toEqual(['sci-fi', 'classic']);
  });
});

describe('snapshotObject of a .ecore file opened as an instance', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'snapshot-ecore-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  // Same loading path InstanceEditorProvider.openExistingInstance uses for a *.ecore file (the
  // package is viewed reflectively, as data - distinct from loadLocalEcorePackage, which is for
  // picking a root class from a .ecore file, not for viewing one). A classifier with no
  // structural features of its own (a self-closed <eClassifiers .../> element) must still appear
  // in the snapshot - this is the regression this test guards.
  it('lists every classifier, including one with no structural features of its own', async () => {
    const path = join(dir, 'mapping.ecore');
    writeFileSync(
      path,
      `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore" name="mapping" nsURI="http://roar-net.com/mapping" nsPrefix="map">
  <eClassifiers xsi:type="ecore:EClass" name="MappingModel"/>
  <eClassifiers xsi:type="ecore:EClass" name="Mapping">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="ecore" eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="variability" eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
  </eClassifiers>
</ecore:EPackage>
`
    );

    const packageRegistry = new EPackageRegistryImpl();
    packageRegistry.register(EcorePackageImpl.eINSTANCE);
    const resourceSet = new ResourceSetImpl(packageRegistry);
    registerXmiFormat(resourceSet.getResourceFactoryRegistry());
    resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());

    const resource = await resourceSet.getResource(URI.createFileURI(path), true);
    const pkg = resource!.getContents().get(0);

    const ids = new ObjectIdMap();
    const snapshot = snapshotObject(pkg, ids);

    const classifierIds = snapshot.references.eClassifiers as string[];
    expect(classifierIds).toHaveLength(2);
    const names = classifierIds.map((id) => {
      const obj = ids.objectFor(id);
      return isENamedElement(obj) ? obj.getName() : undefined;
    });
    expect(names).toEqual(['MappingModel', 'Mapping']);
  });
});
