import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('reflective type guards (util/{Pkg}TypeGuards.ts) - real compilation and runtime verification', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-typeguards-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('generates isX() for every classifier in types/, including abstract ones if present', () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});
    const guards = files.find((f) => f.path === 'util/LibraryTypeGuards.ts')!;

    expect(guards.content).toContain('export function isBook(obj: unknown): obj is Book {');
    expect(guards.content).toContain('export function isAudioBook(obj: unknown): obj is AudioBook {');
    expect(guards.content).toContain('export function isLibrary(obj: unknown): obj is Library {');
    expect(guards.content).toContain('.isSuperTypeOf(obj.eClass())');
  });

  it('correctly recognizes a direct instance, correctly recognizes a SUBCLASS instance too, correctly rejects an unrelated instance, and safely rejects non-EObject input', async () => {
    const { libraryPackage } = buildSampleMetamodel();
    const files = generate(libraryPackage, typescriptTemplateSet, {});

    for (const file of files) {
      const tsPath = join(dir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
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

    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const jsPath = join(dir, file.path.replace(/\.ts$/, '.js'));
      const { outputText } = ts.transpileModule(file.content, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }

    const { LibraryFactoryImpl } = (await import(jsPaths.get('impl/LibraryFactoryImpl.ts')!)) as {
      LibraryFactoryImpl: new () => {
        createBook(): unknown;
        createAudioBook(): unknown;
        createLibrary(): unknown;
      };
    };
    const guardsModule = (await import(jsPaths.get('util/LibraryTypeGuards.ts')!)) as {
      isBook(obj: unknown): boolean;
      isAudioBook(obj: unknown): boolean;
      isLibrary(obj: unknown): boolean;
    };

    const factory = new LibraryFactoryImpl();
    const book = factory.createBook();
    const audioBook = factory.createAudioBook();
    const library = factory.createLibrary();

    // Direct instance.
    expect(guardsModule.isBook(book)).toBe(true);
    // The key case: AudioBook extends Book, so an AudioBook instance must
    // ALSO satisfy isBook() - exactly the benefit a naive per-class marker
    // check couldn't guarantee for an arbitrary metamodel.
    expect(guardsModule.isBook(audioBook)).toBe(true);
    expect(guardsModule.isAudioBook(audioBook)).toBe(true);
    // An unrelated classifier is correctly rejected both ways.
    expect(guardsModule.isBook(library)).toBe(false);
    expect(guardsModule.isAudioBook(book)).toBe(false);
    expect(guardsModule.isLibrary(book)).toBe(false);

    // Safe on non-EObject input - no throwing, just false.
    expect(guardsModule.isBook(null)).toBe(false);
    expect(guardsModule.isBook(undefined)).toBe(false);
    expect(guardsModule.isBook('a string')).toBe(false);
    expect(guardsModule.isBook({})).toBe(false);
    expect(guardsModule.isBook(42)).toBe(false);
  });
});
