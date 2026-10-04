import { EClassImpl } from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { GeneratedFile } from '../generated-file.js';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generates the sample metamodel, type-checks the output and runs it. The output directory lies
 * inside packages/generator so that the generated imports resolve `@typemf/core` from this
 * package's node_modules.
 */
describe('generated code for the sample metamodel', () => {
  let dir: string;
  let files: GeneratedFile[];
  const jsPaths = new Map<string, string>();
  const load = async (path: string): Promise<any> => import(jsPaths.get(path)!);

  beforeAll(async () => {
    dir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-generated-'));
    files = generate(buildSampleMetamodel().libraryPackage, typescriptTemplateSet, {});
    for (const file of files) {
      const tsPath = join(dir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
      const jsPath = tsPath.replace(/\.ts$/, '.js');
      const { outputText } = ts.transpileModule(file.content, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  async function sample() {
    const { LibraryPackageImpl } = await load('impl/LibraryPackageImpl.ts');
    const { LibraryFactoryImpl } = await load('impl/LibraryFactoryImpl.ts');
    const pkg = LibraryPackageImpl.eINSTANCE;
    return { pkg, factory: new LibraryFactoryImpl() };
  }

  it('type-checks', () => {
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
  });

  it('supports accessors, containment, references and reflection', async () => {
    const { pkg, factory } = await sample();
    const book = factory.create(pkg.getBook());
    book.setTitle('Dune');
    expect(book.getTitle()).toBe('Dune');

    const audioBook = factory.create(pkg.getAudioBook());
    audioBook.setTitle('Foundation');
    audioBook.setNarrator('Scott Brick');
    expect(audioBook.getNarrator()).toBe('Scott Brick');
    expect(audioBook.getTitle()).toBe('Foundation');

    const library = factory.create(pkg.getLibrary());
    library.getBooks().add(book);
    library.getBooks().add(audioBook);
    expect(book.eContainer()).toBe(library);
    expect(audioBook.eContainer()).toBe(library);
    expect(library.eContents().size()).toBe(2);

    library.setFeaturedBook(book);
    expect(library.getFeaturedBook()).toBe(book);
    expect(book.eContainer()).toBe(library);

    const titleAttr = pkg.getBook_Title();
    expect(book.eIsSet(titleAttr)).toBe(true);
    expect(book.eGet(titleAttr)).toBe('Dune');
    book.eUnset(titleAttr);
    expect(book.eIsSet(titleAttr)).toBe(false);
  });

  it('dispatches the switch to the case of the closest supertype', async () => {
    const { pkg, factory } = await sample();
    const { LibrarySwitch } = await load('util/LibrarySwitch.ts');
    class TitleSwitch extends LibrarySwitch {
      caseBook(object: { getTitle(): string }): string {
        return `Book: ${object.getTitle()}`;
      }
    }
    const audioBook = factory.create(pkg.getAudioBook());
    audioBook.setTitle('Foundation');
    expect(new TitleSwitch().doSwitch(audioBook)).toBe('Book: Foundation');
  });

  it('generates type guards that accept subclasses and reject everything else', async () => {
    const { factory } = await sample();
    const guards = await load('util/LibraryTypeGuards.ts');
    const book = factory.createBook();
    const audioBook = factory.createAudioBook();
    const library = factory.createLibrary();

    expect(guards.isBook(book)).toBe(true);
    expect(guards.isBook(audioBook)).toBe(true);
    expect(guards.isAudioBook(audioBook)).toBe(true);
    expect(guards.isBook(library)).toBe(false);
    expect(guards.isAudioBook(book)).toBe(false);
    expect(guards.isLibrary(book)).toBe(false);
    for (const value of [null, undefined, 'a string', {}, 42]) expect(guards.isBook(value)).toBe(false);
  });

  it('falls back to EFactoryImpl.create() for a classifier the factory does not know', async () => {
    const { factory } = await sample();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const foreign = new EClassImpl();
    foreign.setName('Foreign');
    foreign.setClassifierID(424242);
    const instance = factory.create(foreign);
    expect(instance.constructor.name).toBe('DynamicEObjectImpl');
    expect(instance.eClass()).toBe(foreign);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/classifier id 424242.*Foreign.*DynamicEObjectImpl/);
    warn.mockRestore();
  });

  it("sets each feature's container class to the generated implementation class", async () => {
    const { pkg } = await sample();
    const { BookImpl } = await load('impl/BookImpl.ts');
    expect(pkg.getBook_Title().getContainerClass()).toBe(BookImpl);
  });
});
