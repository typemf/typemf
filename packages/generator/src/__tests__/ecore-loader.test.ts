import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';

/**
 * A small, real .ecore file - not our own bootstrap seed graph, an
 * actual file on disk, written in real Ecore's own XMI conventions
 * (name-based fragments, xsi:type dispatch) - the same shape
 * loadEcorePackage needs to handle for the real Ecore.ecore file itself,
 * just far smaller so a bug here is easy to localize.
 */
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

describe('loadEcorePackage - a real .ecore file on disk', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-ecore-loader-test-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('loads package-level properties, classes, inheritance, and containment references', async () => {
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
    expect(bookClass.getEStructuralFeatures().toArray().map((f: { getName(): string }) => f.getName())).toContain(
      'title'
    );

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

  it('throws a clear error for a nonexistent file', async () => {
    await expect(loadEcorePackage(join(dir, 'does-not-exist.ecore'))).rejects.toThrow();
  });
});
