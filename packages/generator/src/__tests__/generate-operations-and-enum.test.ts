import { DynamicEFactoryImpl, EAnnotationImpl, EAttributeImpl, EClassImpl, EDataTypeImpl, EEnumImpl, EEnumLiteralImpl, EOperationImpl, EPackageImpl, setDetailValue } from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

/**
 * A small, standalone metamodel exercising EOperation (with the
 * operation-body annotation) and EEnum - neither exists in the shared
 * sample-metamodel.ts fixture used elsewhere.
 */
function buildOperationsAndEnumMetamodel() {
  const eStringType = annotatedDataType('EString', 'string');

  const genreEnum = new EEnumImpl();
  genreEnum.setName('Genre');
  const scifi = new EEnumLiteralImpl();
  scifi.setName('SciFi');
  scifi.setValue(0);
  scifi.setLiteral('SciFi');
  genreEnum.getELiterals().add(scifi);
  const fantasy = new EEnumLiteralImpl();
  fantasy.setName('Fantasy');
  fantasy.setValue(1);
  fantasy.setLiteral('Fantasy');
  genreEnum.getELiterals().add(fantasy);

  const bookClass = new EClassImpl();
  bookClass.setName('Book');

  const titleAttr = new EAttributeImpl();
  titleAttr.setName('title');
  titleAttr.setEType(eStringType);
  titleAttr.setFeatureID(0);
  titleAttr.setEContainingClass(bookClass);

  const genreAttr = new EAttributeImpl();
  genreAttr.setName('genre');
  genreAttr.setEType(genreEnum);
  genreAttr.setFeatureID(1);
  genreAttr.setEContainingClass(bookClass);

  bookClass.getEStructuralFeatures().add(titleAttr);
  bookClass.getEStructuralFeatures().add(genreAttr);

  // An operation WITH a body annotation - should generate as a concrete
  // method. Marked required (lowerBound=1): it always computes a real
  // string from the book's own fields, never genuinely undefined - a
  // meaningful test of tsOperationReturnType()'s "required -> no
  // | undefined" case, complementing overloaded-operations.test.ts's
  // "not required -> | undefined" case for the `find` operations there.
  const describeOp = new EOperationImpl();
  describeOp.setName('describe');
  describeOp.setEType(eStringType);
  describeOp.setLowerBound(1);
  const bodyAnnotation = new EAnnotationImpl();
  bodyAnnotation.setSource('https://typemf.dev/generator');
  setDetailValue(bodyAnnotation.getDetails(), 'body', "return this.getTitle() + ' (' + this.getGenre() + ')';");
  describeOp.getEAnnotations().add(bodyAnnotation);
  bookClass.getEOperations().add(describeOp);

  const pkg = new EPackageImpl();
  pkg.setName('library2');
  pkg.setNsURI('https://typemf.dev/samples/library2');
  pkg.setNsPrefix('lib2');
  pkg.getEClassifiers().add(eStringType);
  pkg.getEClassifiers().add(genreEnum);
  pkg.getEClassifiers().add(bookClass);
  for (const classifier of pkg.getEClassifiers()) (classifier as EClassImpl).setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());

  return { pkg, bookClass, titleAttr, genreAttr, genreEnum };
}

describe('End-to-end: EOperation (with operation-body annotation) and EEnum', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-ops-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('generates a concrete method for an operation with a body annotation, and a real TS enum, both compiling and running', async () => {
    const { pkg } = buildOperationsAndEnumMetamodel();
    const files = generate(pkg, typescriptTemplateSet, {});

    const bookImpl = files.find((f) => f.path === 'impl/BookImpl.ts')!;
    expect(bookImpl.content).toContain('describe(): string {');
    expect(bookImpl.content).toContain("return this.getTitle() + ' (' + this.getGenre() + ')';");
    expect(bookImpl.content).not.toContain('abstract describe');

    const genreFile = files.find((f) => f.path === 'types/Genre.ts')!;
    expect(genreFile.content).toContain('export enum Genre {');
    expect(genreFile.content).toContain('SciFi = "SciFi"');
    expect(genreFile.content).toContain('Fantasy = "Fantasy"');

    // Write, type-check, transpile, and actually run.
    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const tsPath = join(dir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');

      const jsPath = join(dir, file.path.replace(/\.ts$/, '.js'));
      const { outputText } = ts.transpileModule(file.content, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }

    const program = ts.createProgram(
      files.map((f) => join(dir, f.path)),
      {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        noEmit: true,
      }
    );
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => dir,
      getCanonicalFileName: (f) => f,
      getNewLine: () => '\n',
    });
    expect(diagnostics, formatted).toHaveLength(0);

    const { Library2FactoryImpl } = (await import(jsPaths.get('impl/Library2FactoryImpl.ts')!)) as {
      Library2FactoryImpl: new () => { create(eClass: unknown): unknown };
    };
    const { Library2PackageImpl } = (await import(jsPaths.get('impl/Library2PackageImpl.ts')!)) as {
      Library2PackageImpl: { eINSTANCE: { getBook(): unknown } };
    };
    const { Genre } = (await import(jsPaths.get('types/Genre.ts')!)) as { Genre: Record<string, string> };

    const factory = new Library2FactoryImpl();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const book: any = factory.create(Library2PackageImpl.eINSTANCE.getBook());
    book.setTitle('Dune');
    book.setGenre(Genre.SciFi);

    expect(book.getGenre()).toBe('SciFi');
    expect(book.describe()).toBe('Dune (SciFi)');
  });
});
