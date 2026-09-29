import { DynamicEFactoryImpl, EClassImpl, EcorePackageImpl, EPackageImpl } from '@typemf/core';

// See NOTES.md's point 6/7 write-ups: every generated setter routes through getEcorePackageRef(), which
// needs Ecore's own metaclass system bootstrapped first - this triggers that safely, once, at module
// load, before any test below constructs a raw metaclass instance.
void EcorePackageImpl.eINSTANCE;
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/** A package with one concrete class, Widget - just enough to generate a real {Pkg}FactoryImpl.create(). */
function buildPackage(): EPackageImpl {
  const widget = new EClassImpl();
  widget.setName('Widget');
  const pkg = new EPackageImpl();
  pkg.setName('fac');
  pkg.setNsURI('https://typemf.dev/test/fac');
  pkg.setNsPrefix('fac');
  pkg.getEClassifiers().add(widget);
  widget.setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());
  return pkg;
}

describe('efactory.njk: create() delegates to super.create() for an unrecognized classifier, instead of throwing locally', () => {
  it('the generated default case calls super.create(eClass), and there is no local "not a known classifier" throw', () => {
    const files = generate(buildPackage(), typescriptTemplateSet, {});
    const impl = files.find((f) => f.path === 'impl/FacFactoryImpl.ts')!.content;
    expect(impl).toContain('return super.create(eClass);');
    expect(impl).not.toContain('not a known, concrete classifier');
  });

  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-facfallback-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('type-checks with zero errors', async () => {
    const files = generate(buildPackage(), typescriptTemplateSet, {});
    for (const file of files) {
      const tsPath = join(dir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
    }
    const program = ts.createProgram(files.map((f) => join(dir, f.path)), {
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

  it('ACTUALLY RUNS: a recognized classifier still creates correctly; an unrecognized one reaches the BASE EFactoryImpl.create(), warns, and falls back to a DynamicEObjectImpl', async () => {
    const files = generate(buildPackage(), typescriptTemplateSet, {});
    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const jsPath = join(dir, file.path.replace(/\.ts$/, '.js'));
      await mkdir(dirname(jsPath), { recursive: true });
      const { outputText } = ts.transpileModule(file.content, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }
    const { FacFactoryImpl } = (await import(jsPaths.get('impl/FacFactoryImpl.ts')!)) as { FacFactoryImpl: new () => { create(c: unknown): unknown } };
    const { FacPackageImpl } = (await import(jsPaths.get('impl/FacPackageImpl.ts')!)) as { FacPackageImpl: { eINSTANCE: { getWidget(): unknown } } };
    const factory = new FacFactoryImpl();

    // Recognized: still works (the positive path this change must not break).
    const widget = factory.create(FacPackageImpl.eINSTANCE.getWidget());
    expect((widget as { constructor: { name: string } }).constructor.name).toBe('WidgetImpl');

    // Unrecognized: falls through Fac's own switch, reaches @typemf/core's EFactoryImpl.create(),
    // which warns and falls back to a real DynamicEObjectImpl rather than throwing - not a locally
    // duplicated message, and not silently returning undefined either.
    const warn = (await import('vitest')).vi.spyOn(console, 'warn').mockImplementation(() => {});
    const foreign = new EClassImpl();
    foreign.setName('Foreign');
    foreign.setClassifierID(424242);
    const instance = factory.create(foreign) as { eClass(): unknown; constructor: { name: string } };
    expect(instance.constructor.name).toBe('DynamicEObjectImpl');
    expect(instance.eClass()).toBe(foreign);
    expect(warn).toHaveBeenCalledTimes(1);
    expect((warn.mock.calls[0] as unknown[])[0]).toMatch(/classifier id 424242.*Foreign.*DynamicEObjectImpl/);
    warn.mockRestore();
  });
});
