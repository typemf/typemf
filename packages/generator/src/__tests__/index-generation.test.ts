import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('index.ts generation - one per folder (root, types/, impl/)', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-index-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('generates index.ts, types/index.ts, and impl/index.ts, each re-exporting everything in its own folder', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});
    const paths = files.map((f) => f.path);

    expect(paths).toContain('index.ts');
    expect(paths).toContain('types/index.ts');
    expect(paths).toContain('impl/index.ts');

    const rootIndex = files.find((f) => f.path === 'index.ts')!;
    expect(rootIndex.content).toContain("export * from './LibraryPackage.js';");
    expect(rootIndex.content).toContain("export * from './LibraryFactory.js';");

    const typesIndex = files.find((f) => f.path === 'types/index.ts')!;
    for (const name of ['Book', 'AudioBook', 'Library']) {
      expect(typesIndex.content).toContain(`export * from './${name}.js';`);
    }
    // types/index.ts stays scoped to its own folder - it does not
    // re-export impl/ or the root files.
    expect(typesIndex.content).not.toContain('Impl');
    expect(typesIndex.content).not.toContain('LibraryPackage');

    const implIndex = files.find((f) => f.path === 'impl/index.ts')!;
    for (const name of ['BookImpl', 'AudioBookImpl', 'LibraryImpl', 'LibraryPackageImpl', 'LibraryFactoryImpl']) {
      expect(implIndex.content).toContain(`export * from './${name}.js';`);
    }
  });

  it('the generated index files are genuinely importable - real compilation, not just text matching', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    for (const file of files) {
      const tsPath = join(dir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
    }

    // A small consumer file that imports EVERYTHING through the three
    // index files only, never reaching into a specific classifier's own
    // file directly - proving the index files actually resolve, not just
    // that their text looks plausible.
    const consumerPath = join(dir, 'consumer.ts');
    await writeFile(
      consumerPath,
      `
      import { LibraryPackage, Ids } from './index.js';
      import type { Book, AudioBook, Library } from './types/index.js';
      import { LibraryPackageImpl, LibraryFactoryImpl, BookImpl } from './impl/index.js';

      export function use(pkg: LibraryPackage, book: Book, audioBook: AudioBook, library: Library): void {
        void pkg;
        void book;
        void audioBook;
        void library;
        void Ids.Book.self;
        void LibraryPackageImpl.eINSTANCE;
        void new LibraryFactoryImpl();
        void new BookImpl();
      }
      `,
      'utf-8'
    );

    const program = ts.createProgram([consumerPath, ...files.map((f) => join(dir, f.path))], {
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
});
