import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

const GENERATOR = 'https://typemf.dev/generator';
const ECORE = 'http://www.eclipse.org/emf/2002/Ecore';
const GENMODEL = 'http://www.eclipse.org/emf/2002/GenModel';

const doc = (source: string, text: string) =>
  `<eAnnotations source="${source}"><details key="documentation" value="${text}"/></eAnnotations>`;

/** An .ecore file with documentation in both sources on every kind of element that gets a doc comment. */
const ECORE_SRC = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="docs" nsURI="https://typemf.dev/test/docs" nsPrefix="docs">
  ${doc(ECORE, 'Package doc from Ecore.')}
  <eClassifiers xsi:type="ecore:EDataType" name="EString" instanceClassName="java.lang.String">
    <eAnnotations source="${GENERATOR}"><details key="type" value="string"/></eAnnotations>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EEnum" name="Genre">
    ${doc(GENERATOR, 'Enum doc from typemf.&#10;Second line.')}
    <eLiterals name="SciFi"/>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Book">
    ${doc(ECORE, 'Class doc - Ecore LOSES.')}
    ${doc(GENERATOR, 'Class doc - typemf WINS.')}
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="title" eType="#//EString">
      ${doc(ECORE, 'Feature doc from Ecore only.')}
    </eStructuralFeatures>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="isbn" eType="#//EString">
      ${doc(GENERATOR, '')}
      ${doc(ECORE, 'Feature doc - empty typemf falls back.')}
    </eStructuralFeatures>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="plain" eType="#//EString"/>
    <eOperations name="shout" lowerBound="1" eType="#//EString">
      ${doc(GENERATOR, 'Operation doc from typemf.')}
      <eAnnotations source="${GENERATOR}"><details key="body" value="return 'x';"/></eAnnotations>
    </eOperations>
  </eClassifiers>
</ecore:EPackage>
`;

const escapeRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** `comment` is directly above `declaration`. */
const documents = (content: string, comment: string, declaration: string) =>
  expect(content).toMatch(new RegExp(`${escapeRe(comment)}\\n${escapeRe(declaration)}`));

describe('documentation from an .ecore file', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-docs-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  async function generated() {
    const path = join(dir, 'docs.ecore');
    await writeFile(path, ECORE_SRC, 'utf-8');
    const files = generate(await loadEcorePackage(path), typescriptTemplateSet, {});
    return (p: string) => files.find((f) => f.path === p)!.content;
  }

  it('a class uses the typemf documentation over the others', async () => {
    const out = await generated();
    for (const path of ['types/Book.ts', 'impl/BookImpl.ts']) {
      documents(out(path), '/** Class doc - typemf WINS. */', 'export ');
      expect(out(path), path).not.toContain('Ecore LOSES');
    }
  });

  it('a feature falls back to the Ecore documentation', async () => {
    documents(
      await generated().then((o) => o('types/Book.ts')),
      '  /** Feature doc from Ecore only. */',
      '  getTitle()'
    );
  });

  it('a feature with an empty typemf documentation falls back to GenModel', async () => {
    documents(
      await generated().then((o) => o('types/Book.ts')),
      '  /** Feature doc - empty typemf falls back. */',
      '  getIsbn()'
    );
  });

  it('GenModel documentation is not read', async () => {
    const path = join(dir, 'gm.ecore');
    await writeFile(
      path,
      ECORE_SRC.replace(doc(ECORE, 'Feature doc from Ecore only.'), doc(GENMODEL, 'GenModel doc.')),
      'utf-8'
    );
    const files = generate(await loadEcorePackage(path), typescriptTemplateSet, {});
    const book = files.find((f) => f.path === 'types/Book.ts')!.content;
    expect(book).not.toContain('GenModel doc.');
    expect(book).not.toMatch(/\*\/\n\s*getTitle\(\)/);
  });

  it('a feature with no documentation in either source gets no comment', async () => {
    expect(await generated().then((o) => o('types/Book.ts'))).not.toMatch(/\*\/\n\n? {2}getPlain\(\)/);
  });

  it('an operation uses the typemf documentation', async () => {
    documents(await generated().then((o) => o('types/Book.ts')), '  /** Operation doc from typemf. */', '  shout()');
  });

  it('an enum turns multi-line documentation into a JSDoc block', async () => {
    documents(
      await generated().then((o) => o('types/Genre.ts')),
      '/**\n * Enum doc from typemf.\n * Second line.\n */',
      'export enum Genre'
    );
  });

  it('the package documentation appears on the interface and the implementation', async () => {
    const out = await generated();
    documents(out('DocsPackage.ts'), '/** Package doc from Ecore. */', 'export interface DocsPackage');
    documents(out('impl/DocsPackageImpl.ts'), '/** Package doc from Ecore. */', 'export class DocsPackageImpl');
  });
});
