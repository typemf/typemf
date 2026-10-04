import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EClass, EcorePackageImpl } from '@typemf/core';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/** A small .ecore file in EMF's XMI conventions (name-based fragments, xsi:type). */
const SAMPLE_ECORE = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="library" nsURI="https://typemf.dev/test/library" nsPrefix="lib">
  <eClassifiers xsi:type="ecore:EDataType" name="EString"/>
  <eClassifiers xsi:type="ecore:EClass" name="Book">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="title" eType="#//EString"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="AudioBook" eSuperTypes="#//Book">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="narrator" eType="#//EString"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Library">
    <eStructuralFeatures xsi:type="ecore:EReference" name="books" upperBound="-1"
        eType="#//Book" containment="true"/>
  </eClassifiers>
</ecore:EPackage>
`;

describe('loadEcorePackage', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-ecore-loader-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('loads package properties, classes, inheritance and containment references', async () => {
    const path = join(dir, 'library.ecore');
    await writeFile(path, SAMPLE_ECORE, 'utf-8');

    const pkg = await loadEcorePackage(path);

    expect(pkg.getName()).toBe('library');
    expect(pkg.getNsURI()).toBe('https://typemf.dev/test/library');
    expect(pkg.getNsPrefix()).toBe('lib');

    const book = pkg.getEClassifier('Book')!;
    expect(book.getName()).toBe('Book');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookClass = book as any;
    expect(
      bookClass
        .getEStructuralFeatures()
        .toArray()
        .map((f: { getName(): string }) => f.getName())
    ).toContain('title');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioBook = pkg.getEClassifier('AudioBook') as any;
    expect(audioBook.getESuperTypes().toArray()).toContain(book);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const library = pkg.getEClassifier('Library') as any;
    const booksRef = library
      .getEStructuralFeatures()
      .toArray()
      .find((f: { getName(): string }) => f.getName() === 'books');
    expect(booksRef.isMany()).toBe(true);
    expect(booksRef.isContainment()).toBe(true);
    expect(booksRef.getEType()).toBe(book);
  });

  it('throws for a missing file', async () => {
    await expect(loadEcorePackage(join(dir, 'does-not-exist.ecore'))).rejects.toThrow();
  });
});

const ECORE_TYPES_ECORE = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="library" nsURI="https://typemf.dev/test/library" nsPrefix="lib">
  <eClassifiers xsi:type="ecore:EClass" name="Book">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="title" eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="pages">
      <eType xsi:type="ecore:EDataType" href="http://www.eclipse.org/emf/2002/Ecore#//EInt"/>
    </eStructuralFeatures>
  </eClassifiers>
</ecore:EPackage>
`;

describe('loadEcorePackage - references to Ecore classifiers', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-ecore-loader-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("resolves Ecore's data types in attribute and element notation, and generates their TypeScript types", async () => {
    const path = join(dir, 'library.ecore');
    await writeFile(path, ECORE_TYPES_ECORE, 'utf-8');

    const pkg = await loadEcorePackage(path);
    const book = pkg.getEClassifier('Book') as EClass;

    expect(book.getEStructuralFeature('title')!.getEType()).toBe(EcorePackageImpl.eINSTANCE.getEString());
    expect(book.getEStructuralFeature('pages')!.getEType()).toBe(EcorePackageImpl.eINSTANCE.getEInt());

    const files = generate(pkg, typescriptTemplateSet, {});
    const content = (name: string) => files.find((f) => f.path.endsWith(name))!.content;
    expect(content('types/Book.ts')).toContain('getTitle(): string | undefined;');
    expect(content('types/Book.ts')).toContain('getPages(): number;');
    expect(content('impl/LibraryPackageImpl.ts')).toContain('setEType(EcorePackageImpl.eINSTANCE.getEString())');
  });

  it('throws for a reference to a classifier outside this package and Ecore', async () => {
    const path = join(dir, 'library.ecore');
    await writeFile(
      path,
      ECORE_TYPES_ECORE.replace('http://www.eclipse.org/emf/2002/Ecore#//EString', 'https://example.org/other#//Text'),
      'utf-8'
    );

    await expect(loadEcorePackage(path)).rejects.toThrow(/Cannot resolve the classifier reference/);
  });
});
