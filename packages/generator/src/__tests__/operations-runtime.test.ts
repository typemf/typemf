import { EAttributeImpl, EClassImpl, EcorePackageImpl, EDataTypeImpl, EOperationImpl, EPackageImpl, EParameterImpl, EReferenceImpl } from '@typemf/core';

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

const GENERATOR = 'https://typemf.dev/generator';

/**
 * Point 3 (operations exist at runtime) fixed the SELF-HOSTED case - real Ecore.ecore, verified via
 * check_ecore.py against the full real workspace (self-hosted output cannot run in isolation - see
 * point 2's own tests for why). But the SAME template change also touches ORDINARY (non-self-hosting)
 * mode, which CAN run in isolation here, and which is what most real users of this tool actually use -
 * so this is the dedicated, real-execution regression guard for that path specifically, not covered by
 * any existing test (the closest one, generate-operations-and-enum.test.ts, only builds the INPUT
 * metamodel's operations, never checks the GENERATED OUTPUT's runtime getEOperations()).
 */
function buildPackage(): EPackageImpl {
  const eString = new EDataTypeImpl();
  eString.setName('EString');
  const stringAnnotation = {
    getSource: () => GENERATOR,
    getDetails: () => [{ getKey: () => 'type', getValue: () => 'string' }],
    getEModelElement: () => undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  eString.getEAnnotations().add(stringAnnotation);

  const widget = new EClassImpl();
  widget.setName('Widget');
  const label = new EAttributeImpl();
  label.setName('label');
  label.setEType(eString);
  widget.getEStructuralFeatures().add(label);

  const describe = new EOperationImpl();
  describe.setName('describe');
  describe.setEType(eString);
  const verbose = new EParameterImpl();
  verbose.setName('verbose');
  describe.getEParameters().add(verbose);
  const annotation = {
    getSource: () => GENERATOR,
    getDetails: () => [{ getKey: () => 'body', getValue: () => "return verbose ? 'a widget, verbosely' : 'a widget';" }],
    getEModelElement: () => undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  describe.getEAnnotations().add(annotation);
  widget.getEOperations().add(describe);

  const box = new EClassImpl();
  box.setName('Box');
  const contents = new EReferenceImpl();
  contents.setName('contents');
  contents.setEType(widget);
  contents.setContainment(true);
  contents.setUpperBound(-1);
  box.getEStructuralFeatures().add(contents);

  const pkg = new EPackageImpl();
  pkg.setName('ops');
  pkg.setNsURI('https://typemf.dev/test/ops');
  pkg.setNsPrefix('ops');
  for (const cls of [eString, widget, box]) {
    pkg.getEClassifiers().add(cls);
    cls.setEPackage(pkg);
  }
  return pkg;
}

describe('operations exist at runtime (point 3), ordinary mode - real execution, not just compilation', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-opsruntime-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('type-checks with zero errors, and ACTUALLY RUNS: getEOperations() returns a real EOperation with the right name, parameter, and containing class - and the generated METHOD still works too', async () => {
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

    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const jsPath = join(dir, file.path.replace(/\.ts$/, '.js'));
      const { outputText } = ts.transpileModule(file.content, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }

    const { OpsPackageImpl } = (await import(jsPaths.get('impl/OpsPackageImpl.ts')!)) as {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      OpsPackageImpl: { eINSTANCE: { getWidget(): any; getEFactoryInstance(): { create(c: unknown): unknown } } };
    };
    const pkg = OpsPackageImpl.eINSTANCE;
    const widgetMeta = pkg.getWidget();

    // The reflective metamodel: a real EOperation object, not an empty list.
    const ownOps = [...widgetMeta.getEOperations()];
    expect(ownOps).toHaveLength(1);
    expect(ownOps[0].getName()).toBe('describe');
    expect(ownOps[0].getEParameters().size()).toBe(1);
    expect(ownOps[0].getEParameters().get(0).getName()).toBe('verbose');
    expect(ownOps[0].getEContainingClass()).toBe(widgetMeta); // real back-pointer, the actual object

    // The generated METHOD still actually works too - the reflective addition didn't break codegen.
    // DynamicEFactoryImpl would only produce a purely reflective object with no generated methods at
    // all - the package's OWN factory is what actually constructs a real, generated WidgetImpl.
    const factory = pkg.getEFactoryInstance();
    const instance = factory.create(widgetMeta) as unknown as { describe(verbose: boolean): string };
    expect(instance.describe(true)).toBe('a widget, verbosely');
    expect(instance.describe(false)).toBe('a widget');
  });
});
