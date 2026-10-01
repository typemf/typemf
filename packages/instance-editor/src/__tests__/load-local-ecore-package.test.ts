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

  it('loads the real EPackage, with its own real classifiers', async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    expect(pkg.getName()).toBe('library');
    const names = pkg.getEClassifiers().map((c) => c.getName());
    expect(names).toContain('Book');
  });

  it('the returned package has a real factory - an instance can actually be constructed from one of its classifiers (this is exactly the bug that went uncaught before)', async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    const bookClass = pkg.getEClassifiers().find((c) => c.getName() === 'Book');
    expect(bookClass).toBeDefined();
    expect(isEClass(bookClass)).toBe(true);
    if (!isEClass(bookClass)) return;

    // This is the actual assertion that matters - createInstanceOf throws its own, clear error if
    // the package has no EFactoryInstance registered, which is precisely what happened in
    // production before this fix.
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

  // The real, reported bug this covers: "new instance of a dynamic model freezes on Loading…" -
  // reproduced directly, then traced to two separate, stacked causes, both fixed here.
  it('a same-attribute, cross-document eType reference (into Ecore\'s own metamodel) is eagerly resolved, not left as an unresolved proxy', async () => {
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

  it('every feature on a class gets its own, distinct featureID - no two features silently share DynamicEObjectImpl\'s one Map<featureID, value> slot', async () => {
    const pkg = await loadLocalEcorePackage({ fsPath: filePath });
    const bookClass = pkg.getEClassifiers().find((c) => c.getName() === 'Book');
    expect(isEClass(bookClass)).toBe(true);
    if (!isEClass(bookClass)) return;

    const ids = [...bookClass.getEStructuralFeatures()].map((f) => f.getFeatureID());
    expect(new Set(ids).size).toBe(ids.length); // every id distinct, none repeated
    expect(ids.every((id) => id >= 0)).toBe(true); // none left at an unassigned sentinel
  });

  it('setting multiple features on one instance keeps them genuinely independent - the real, end-to-end symptom of the featureID collision bug', async () => {
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

  it('an inherited feature keeps its own id, and a subclass\'s own new feature gets a different one, not colliding with it', async () => {
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
});
