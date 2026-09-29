import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

/**
 * This is the actual proof the generator produces working code, not just
 * plausible-looking text: real files on a real filesystem path, type-
 * checked with the TypeScript compiler API against the real, built
 * @typemf/core, then transpiled and genuinely executed - instantiating
 * generated classes, exercising containment/opposite bookkeeping (via
 * eDidAdd/eDidRemove, unchanged from @typemf/core, not reimplemented here),
 * factory dispatch, and switch-based visitor dispatch.
 *
 * The temp directory is created INSIDE packages/generator (not os.tmpdir())
 * deliberately: Node's module resolution walks up parent directories
 * looking for node_modules, so files here resolve `@typemf/core` via the
 * same node_modules/@typemf/core this package itself already depends on,
 * with no separate module-resolution setup needed.
 */
describe('End-to-end: generated code actually compiles and runs', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-e2e-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('type-checks with zero errors', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});
    expect(files.length).toBeGreaterThan(0);

    const filePaths: string[] = [];
    for (const file of files) {
      const fullPath = join(dir, file.path);
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, file.content, 'utf-8');
      filePaths.push(fullPath);
    }

    const program = ts.createProgram(filePaths, {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
    });

    const diagnostics = ts.getPreEmitDiagnostics(program);
    const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => dir,
      getCanonicalFileName: (f) => f,
      getNewLine: () => '\n',
    });

    expect(diagnostics, formatted).toHaveLength(0);
  });

  it('actually runs: instantiation, containment, opposites, factory, and switch dispatch all work', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const jsRelativePath = file.path.replace(/\.ts$/, '.js');
      const jsFullPath = join(dir, jsRelativePath);
      await mkdir(dirname(jsFullPath), { recursive: true });
      const { outputText } = ts.transpileModule(file.content, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
      });
      await writeFile(jsFullPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsFullPath);
    }

    const factoryPath = jsPaths.get('impl/LibraryFactoryImpl.ts')!;
    const packagePath = jsPaths.get('impl/LibraryPackageImpl.ts')!;
    const switchPath = jsPaths.get('util/LibrarySwitch.ts')!;

    const { LibraryFactoryImpl } = (await import(factoryPath)) as { LibraryFactoryImpl: new () => unknown };
    const { LibraryPackageImpl } = (await import(packagePath)) as {
      LibraryPackageImpl: { eINSTANCE: { getBook(): unknown; getAudioBook(): unknown; getLibrary(): unknown } };
    };
    const { LibrarySwitch } = (await import(switchPath)) as { LibrarySwitch: new () => unknown };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factory = new (LibraryFactoryImpl as any)();
    const eClasses = LibraryPackageImpl.eINSTANCE;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const book: any = factory.create(eClasses.getBook());
    book.setTitle('Dune');
    expect(book.getTitle()).toBe('Dune');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioBook: any = factory.create(eClasses.getAudioBook());
    audioBook.setTitle('Foundation');
    audioBook.setNarrator('Scott Brick');
    expect(audioBook.getNarrator()).toBe('Scott Brick');
    // Inherited getter, defined on BookGen, used on an AudioBookImpl instance.
    expect(audioBook.getTitle()).toBe('Foundation');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const library: any = factory.create(eClasses.getLibrary());
    library.getBooks().add(book);
    library.getBooks().add(audioBook);

    // Containment: unchanged @typemf/core logic (eDidAdd -> eBasicMoveInto),
    // reached here only through generated code's eSet/BasicEList wiring.
    expect(book.eContainer()).toBe(library);
    expect(audioBook.eContainer()).toBe(library);
    expect(library.eContents().size()).toBe(2);

    // Non-containment reference.
    library.setFeaturedBook(book);
    expect(library.getFeaturedBook()).toBe(book);
    expect(book.eContainer()).toBe(library); // unchanged - featuredBook isn't containment

    // eGet/eSet/eIsSet/eUnset via the reflective path, not just bean accessors.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const titleAttr = (eClasses as any).getBook_Title();
    expect(book.eIsSet(titleAttr)).toBe(true);
    expect(book.eGet(titleAttr)).toBe('Dune');
    book.eUnset(titleAttr);
    expect(book.eIsSet(titleAttr)).toBe(false);
    book.setTitle('Dune'); // restore for fullId() below

    expect(book.fullId()).toBe('Book_Dune');

    // Switch-based visitor dispatch, including supertype fallthrough
    // (AudioBook falls through to caseBook when caseAudioBook is not
    // overridden).
    class TitleSwitch extends (LibrarySwitch as new () => { doSwitch(o: unknown): unknown }) {
      caseBook(object: { getTitle(): string }): string {
        return `Book: ${object.getTitle()}`;
      }
    }
    const titleSwitch = new TitleSwitch();
    expect(titleSwitch.doSwitch(book)).toBe('Book: Dune');
    expect(titleSwitch.doSwitch(audioBook)).toBe('Book: Foundation'); // fell through to caseBook
  });
});
