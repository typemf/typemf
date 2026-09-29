import { EAnnotationImpl, EAttributeImpl, EClassImpl, EDataTypeImpl, EPackageImpl, detailValue, setDetailValue } from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

/**
 * A tiny metamodel where the package, a class, and an attribute each carry
 * a real GenModel-style documentation EAnnotation - including one with an
 * apostrophe, the exact case that motivated the jsString() fix - proving
 * the whole path (source metamodel -> generated Package.ts construction
 * code -> compiled -> executed -> queried via getEAnnotation()) actually
 * works end to end, not just that the generated text looks right.
 */
function buildAnnotatedMetamodel() {
  const eString = annotatedDataType('EString', 'string');

  const widget = new EClassImpl();
  widget.setName('Widget');
  const widgetDoc = new EAnnotationImpl();
  widgetDoc.setSource('http://www.eclipse.org/emf/2002/GenModel');
  setDetailValue(widgetDoc.getDetails(), 'documentation', "A widget, with an apostrophe's worth of trouble.");
  widget.getEAnnotations().add(widgetDoc);

  const name = new EAttributeImpl();
  name.setName('name');
  name.setEType(eString);
  const nameDoc = new EAnnotationImpl();
  nameDoc.setSource('http://www.eclipse.org/emf/2002/GenModel');
  setDetailValue(nameDoc.getDetails(), 'documentation', 'The widget\'s "name" - note the embedded quotes.');
  name.getEAnnotations().add(nameDoc);
  widget.getEStructuralFeatures().add(name);

  const pkg = new EPackageImpl();
  pkg.setName('annotatedtest');
  pkg.setNsURI('https://typemf.dev/test/annotated');
  pkg.setNsPrefix('annotated');
  const pkgDoc = new EAnnotationImpl();
  pkgDoc.setSource('http://www.eclipse.org/emf/2002/GenModel');
  setDetailValue(pkgDoc.getDetails(), 'documentation', 'The package-level documentation.');
  pkg.getEAnnotations().add(pkgDoc);
  pkg.getEClassifiers().add(eString);
  pkg.getEClassifiers().add(widget);
  for (const c of pkg.getEClassifiers()) (c as EClassImpl).setEPackage(pkg);

  return { pkg };
}

describe('EAnnotations are queryable at runtime on generated code - real proof', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-annotations-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('generates real annotation-construction code, and getEAnnotation() works on the compiled, running result', async () => {
    const { pkg } = buildAnnotatedMetamodel();
    const files = generate(pkg, typescriptTemplateSet, {});

    const packageImplFile = files.find((f) => f.path === 'impl/AnnotatedtestPackageImpl.ts')!;
    expect(packageImplFile.content).toContain('new EAnnotationImpl()');
    expect(packageImplFile.content).toContain('http://www.eclipse.org/emf/2002/GenModel');
    // The apostrophe case that motivated jsString() - must be valid,
    // safely-escaped TS, not naive single-quote wrapping.
    expect(packageImplFile.content).toContain("apostrophe's worth of trouble");
    expect(packageImplFile.content).not.toContain("'A widget, with an apostrophe's"); // would be broken syntax

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

    // Also type-check for real, since this is genuinely new code (the
    // annotation-construction pass), not just previously-proven templates.
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

    const { AnnotatedtestPackageImpl } = (await import(jsPaths.get('impl/AnnotatedtestPackageImpl.ts')!)) as {
      AnnotatedtestPackageImpl: { eINSTANCE: { getWidget(): unknown; getEAnnotation(source: string): unknown } };
    };

    const eClasses = AnnotatedtestPackageImpl.eINSTANCE;

    // Package-level annotation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pkgAnnotation = eClasses.getEAnnotation('http://www.eclipse.org/emf/2002/GenModel') as any;
    expect(detailValue(pkgAnnotation.getDetails(), 'documentation')).toBe('The package-level documentation.');

    // Classifier-level annotation, including the apostrophe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const widgetClass = eClasses.getWidget() as any;
    const widgetAnnotation = widgetClass.getEAnnotation('http://www.eclipse.org/emf/2002/GenModel');
    expect(detailValue(widgetAnnotation.getDetails(), 'documentation')).toBe(
      "A widget, with an apostrophe's worth of trouble."
    );

    // Feature-level annotation, including embedded double quotes.
    const nameFeature = widgetClass.getEStructuralFeatures().get(0);
    const nameAnnotation = nameFeature.getEAnnotation('http://www.eclipse.org/emf/2002/GenModel');
    expect(detailValue(nameAnnotation.getDetails(), 'documentation')).toBe(
      'The widget\'s "name" - note the embedded quotes.'
    );
  });
});
