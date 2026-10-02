import { EAttributeImpl, EClassImpl, EPackageImpl } from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

/** A class with lowerBound/upperBound and the derived `many` and `required` of ETypedElement. */
function buildDerivedFeatureMetamodel() {
  const eString = annotatedDataType('EString', 'string');
  const eInt = annotatedDataType('EInt', 'number');
  const eBoolean = annotatedDataType('EBoolean', 'boolean');

  const widget = new EClassImpl();
  widget.setName('Widget');

  const name = new EAttributeImpl();
  name.setName('name');
  name.setEType(eString);
  widget.getEStructuralFeatures().add(name);

  const lowerBound = new EAttributeImpl();
  lowerBound.setName('lowerBound');
  lowerBound.setEType(eInt);
  widget.getEStructuralFeatures().add(lowerBound);

  const upperBound = new EAttributeImpl();
  upperBound.setName('upperBound');
  upperBound.setEType(eInt);
  widget.getEStructuralFeatures().add(upperBound);

  const many = new EAttributeImpl();
  many.setName('many');
  many.setEType(eBoolean);
  many.setDerived(true);
  many.setChangeable(false);
  widget.getEStructuralFeatures().add(many);

  const required = new EAttributeImpl();
  required.setName('required');
  required.setEType(eBoolean);
  required.setDerived(true);
  required.setChangeable(false);
  widget.getEStructuralFeatures().add(required);

  const pkg = new EPackageImpl();
  pkg.setName('derivedtest');
  pkg.setNsURI('https://typemf.dev/test/derived');
  pkg.setNsPrefix('derived');
  pkg.getEClassifiers().add(eString);
  pkg.getEClassifiers().add(eInt);
  pkg.getEClassifiers().add(eBoolean);
  pkg.getEClassifiers().add(widget);
  for (const c of pkg.getEClassifiers()) (c as EClassImpl).setEPackage(pkg);

  return { pkg, widget, lowerBound, upperBound, many };
}

describe('derived features with built-in formulas', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-derived-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('generate getters without setters that compute many and required', async () => {
    const { pkg } = buildDerivedFeatureMetamodel();
    const files = generate(pkg, typescriptTemplateSet, {});

    const widgetImpl = files.find((f) => f.path === 'impl/WidgetImpl.ts')!;
    expect(widgetImpl.content).toContain('this.getUpperBound() === -1 || this.getUpperBound() > 1');
    expect(widgetImpl.content).not.toContain('setMany(');

    const widgetTypes = files.find((f) => f.path === 'types/Widget.ts')!;
    expect(widgetTypes.content).not.toContain('setMany(');
    expect(widgetTypes.content).toContain('isMany()');

    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const jsPath = join(dir, file.path.replace(/\.ts$/, '.js'));
      await mkdir(dirname(jsPath), { recursive: true });
      const { outputText } = ts.transpileModule(file.content, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }

    const { DerivedtestFactoryImpl } = (await import(jsPaths.get('impl/DerivedtestFactoryImpl.ts')!)) as {
      DerivedtestFactoryImpl: new () => { create(eClass: unknown): unknown };
    };
    const { DerivedtestPackageImpl } = (await import(jsPaths.get('impl/DerivedtestPackageImpl.ts')!)) as {
      DerivedtestPackageImpl: { eINSTANCE: { getWidget(): unknown } };
    };

    const factory = new DerivedtestFactoryImpl();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const widget: any = factory.create(DerivedtestPackageImpl.eINSTANCE.getWidget());

    widget.setUpperBound(1);
    expect(widget.isMany()).toBe(false);

    widget.setUpperBound(5);
    expect(widget.isMany()).toBe(true);

    widget.setUpperBound(-1);
    expect(widget.isMany()).toBe(true);

    // As in EMF, required is lowerBound >= 1, also for many-valued features.
    widget.setLowerBound(0);
    expect(widget.isRequired()).toBe(false);

    widget.setLowerBound(1);
    expect(widget.isRequired()).toBe(true);
    expect(widget.isMany()).toBe(true);
  });
});
