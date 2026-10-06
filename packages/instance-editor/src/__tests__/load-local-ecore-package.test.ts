import { createInstanceOf, EcorePackageImpl, isEClass } from '@typemf/core';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadLocalEcorePackage } from '../load-local-ecore-package.js';

void EcorePackageImpl.eINSTANCE;

const SAMPLE_ECORE = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    name="library" nsURI="https://example.com/library" nsPrefix="library">
  <eClassifiers xsi:type="ecore:EDataType" name="LocalString"/>
  <eClassifiers xsi:type="ecore:EClass" name="Book">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="id" eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="title" eType="//LocalString"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="pageCount" eType="ecore:EDataType http://www.eclipse.org/emf/2002/Ecore#//EInt"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="AudioBook" eSuperTypes="#//Book">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="narrator" eType="//LocalString"/>
  </eClassifiers>
</ecore:EPackage>
`;

describe('loadLocalEcorePackage', () => {
  let dir: string;
  let filePath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'load-local-ecore-'));
    filePath = join(dir, 'library.ecore');
    writeFileSync(filePath, SAMPLE_ECORE);
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('loads the EPackage with its classifiers', async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    expect(pkg.getName()).toBe('library');
    const names = pkg.getEClassifiers().map((c) => c.getName());
    expect(names).toContain('Book');
  });

  it('gives the package a factory that creates instances', async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    const bookClass = pkg.getEClassifiers().find((c) => c.getName() === 'Book');
    expect(bookClass).toBeDefined();
    expect(isEClass(bookClass)).toBe(true);
    if (!isEClass(bookClass)) return;

    const book = createInstanceOf(bookClass);
    expect(book.eClass().getName()).toBe('Book');
  });

  it('a feature on a loaded classifier can be set on a constructed instance', async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    const bookClass = pkg.getEClassifiers().find((c) => c.getName() === 'Book');
    expect(isEClass(bookClass)).toBe(true);
    if (!isEClass(bookClass)) return;
    const titleFeature = bookClass.getEStructuralFeature('title');
    expect(titleFeature).toBeDefined();

    const book = createInstanceOf(bookClass);
    book.eSet(titleFeature!, 'Dune');
    expect(book.eGet(titleFeature!)).toBe('Dune');
  });

  it("resolves an eType reference into Ecore's metamodel", async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    const bookClass = pkg.getEClassifiers().find((c) => c.getName() === 'Book');
    expect(isEClass(bookClass)).toBe(true);
    if (!isEClass(bookClass)) return;

    const idFeature = bookClass.getEStructuralFeature('id');
    const eType = idFeature!.getEType();
    expect(eType?.eIsProxy()).toBe(false);
    expect(eType?.getName()).toBe('EString');

    const pageCountFeature = bookClass.getEStructuralFeature('pageCount');
    expect(pageCountFeature!.getEType()?.getName()).toBe('EInt');
  });

  it('gives every feature of a class its own featureID', async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    const bookClass = pkg.getEClassifiers().find((c) => c.getName() === 'Book');
    expect(isEClass(bookClass)).toBe(true);
    if (!isEClass(bookClass)) return;

    const ids = [...bookClass.getEStructuralFeatures()].map((f) => f.getFeatureID());
    expect(new Set(ids).size).toBe(ids.length); // every id distinct, none repeated
    expect(ids.every((id) => id >= 0)).toBe(true); // none left at an unassigned sentinel
  });

  it('keeps the values of several features apart', async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    const bookClass = pkg.getEClassifiers().find((c) => c.getName() === 'Book');
    expect(isEClass(bookClass)).toBe(true);
    if (!isEClass(bookClass)) return;

    const idFeature = bookClass.getEStructuralFeature('id')!;
    const titleFeature = bookClass.getEStructuralFeature('title')!;
    const pageCountFeature = bookClass.getEStructuralFeature('pageCount')!;

    const book = createInstanceOf(bookClass);
    book.eSet(idFeature, 'book-1');
    book.eSet(titleFeature, 'Dune');
    book.eSet(pageCountFeature, 412);

    expect(book.eGet(idFeature)).toBe('book-1');
    expect(book.eGet(titleFeature)).toBe('Dune');
    expect(book.eGet(pageCountFeature)).toBe(412);
  });

  it("gives a subclass's own feature an id different from the inherited ones", async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    const bookClass = pkg.getEClassifiers().find((c) => c.getName() === 'Book');
    const audioBookClass = pkg.getEClassifiers().find((c) => c.getName() === 'AudioBook');
    expect(isEClass(bookClass) && isEClass(audioBookClass)).toBe(true);
    if (!isEClass(bookClass) || !isEClass(audioBookClass)) return;

    const titleFeature = bookClass.getEStructuralFeature('title')!; // inherited by AudioBook
    const narratorFeature = audioBookClass.getEStructuralFeature('narrator')!; // AudioBook's own
    expect(titleFeature.getFeatureID()).not.toBe(narratorFeature.getFeatureID());

    const audioBook = createInstanceOf(audioBookClass);
    audioBook.eSet(titleFeature, 'Dune (audio)');
    audioBook.eSet(narratorFeature, 'Simon Vance');
    expect(audioBook.eGet(titleFeature)).toBe('Dune (audio)');
    expect(audioBook.eGet(narratorFeature)).toBe('Simon Vance');
  });

  it('loads every classifier even when one has no structural features of its own', async () => {
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

    const pkg = await loadLocalEcorePackage({ fsPath: path });
    const names = pkg.getEClassifiers().map((c) => c.getName());
    expect(names).toEqual(['MappingModel', 'Mapping']);

    const mappingModel = pkg.getEClassifiers().find((c) => c.getName() === 'MappingModel');
    const mapping = pkg.getEClassifiers().find((c) => c.getName() === 'Mapping');
    expect(isEClass(mappingModel) && isEClass(mapping)).toBe(true);
    if (!isEClass(mappingModel) || !isEClass(mapping)) return;
    expect(mappingModel.getEStructuralFeatures().size()).toBe(0);
    expect(mappingModel.getEPackage()).toBe(pkg);
    expect(mapping.getEPackage()).toBe(pkg);
  });
});
