import { EAttributeImpl, EClassImpl, EcorePackageImpl, EPackageImpl } from '@typemf/core';

// See NOTES.md's point 6/7 write-ups: every generated setter routes through getEcorePackageRef(), which
// needs Ecore's own metaclass system bootstrapped first - this triggers that safely, once, at module
// load, before any test below constructs a raw metaclass instance.
void EcorePackageImpl.eINSTANCE;
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/**
 * D3's containerClass bootstrap wiring is unconditional (like featureID - see epackage.njk), so it runs
 * for ORDINARY (non-self-hosting) packages too, not just self-hosted Ecore.ecore - the case most real
 * users of this tool actually hit. The D3 write-up in NOTES.md only had real-execution verification for
 * the self-hosted case (self-hosted output cannot run in isolation, so that verification lived in
 * check_ecore.py against the real workspace); this is the dedicated, in-suite regression guard for the
 * ordinary-mode path, confirmed with real execution here, not just generated text.
 */
describe("containerClass in ordinary mode: a feature's getContainerClass() reports its declaring class's REAL generated constructor", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-containerclass-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('ACTUALLY RUNS: getContainerClass() returns the literal, real WidgetImpl constructor - usable, not just present', async () => {
    const widget = new EClassImpl();
    widget.setName('Widget');
    const label = new EAttributeImpl();
    label.setName('label');
    widget.getEStructuralFeatures().add(label);
    const pkg = new EPackageImpl();
    pkg.setName('containerclasstest');
    pkg.setNsURI('https://typemf.dev/test/containerclass');
    pkg.setNsPrefix('cct');
    pkg.getEClassifiers().add(widget);
    widget.setEPackage(pkg);

    const files = generate(pkg, typescriptTemplateSet, {});
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

    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const jsPath = join(dir, file.path.replace(/\.ts$/, '.js'));
      const { outputText } = ts.transpileModule(file.content, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }

    const { ContainerclasstestPackageImpl } = (await import(jsPaths.get('impl/ContainerclasstestPackageImpl.ts')!)) as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ContainerclasstestPackageImpl: { eINSTANCE: { getWidget(): any } };
    };
    const { WidgetImpl } = (await import(jsPaths.get('impl/WidgetImpl.ts')!)) as { WidgetImpl: new () => unknown };

    const widgetMeta = ContainerclasstestPackageImpl.eINSTANCE.getWidget();
    const labelFeature = widgetMeta.getEStructuralFeature('label');
    expect(labelFeature.getContainerClass()).toBe(WidgetImpl); // the literal class, real execution
    const instance = new (labelFeature.getContainerClass())();
    expect(instance).toBeInstanceOf(WidgetImpl); // genuinely usable as a constructor
  });
});
