import { EAttributeImpl, EClassImpl, EDataTypeImpl, EPackageImpl } from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/**
 * A tiny metamodel with one class having real lowerBound/upperBound
 * attributes and a derived "many" boolean attribute (matching Ecore's own
 * ETypedElement.many exactly) - proves the generated bean getter for
 * "many" actually computes upperBound === -1 || upperBound > 1 at runtime,
 * not just that the generated code type-checks.
 */
function buildDerivedFeatureMetamodel() {
  const eString = new EDataTypeImpl();
  eString.setName('EString');
  const eInt = new EDataTypeImpl();
  eInt.setName('EInt');
  const eBoolean = new EDataTypeImpl();
  eBoolean.setName('EBoolean');

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

  widget.recomputeAllLists();

  const pkg = new EPackageImpl();
  pkg.setName('derivedtest');
  pkg.setNsURI('https://typemf.dev/test/derived');
  pkg.setNsPrefix('derived');
  pkg.getEClassifiers().add(eString);
  pkg.getEClassifiers().add(eInt);
  pkg.getEClassifiers().add(eBoolean);
  pkg.getEClassifiers().add(widget);
  for (const c of pkg.getEClassifiers()) c.setEPackage(pkg);

  return { pkg, widget, lowerBound, upperBound, many };
}

describe('trivial derived-feature formulas - real runtime verification', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-derived-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('generates a "many" getter with no setter, and it computes correctly at runtime', async () => {
    const { pkg } = buildDerivedFeatureMetamodel();
    const files = generate(pkg, typescriptTemplateSet, {});

    const widgetImpl = files.find((f) => f.path === 'impl/WidgetImpl.ts')!;
    expect(widgetImpl.content).toContain('this.getUpperBound() === -1 || this.getUpperBound() > 1');
    expect(widgetImpl.content).not.toContain('setMany(');

    const widgetTypes = files.find((f) => f.path === 'types/Widget.ts')!;
    expect(widgetTypes.content).not.toContain('setMany(');
    expect(widgetTypes.content).toContain('getMany()');

    // Actually compile and run it.
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
    expect(widget.getMany()).toBe(false);

    widget.setUpperBound(5);
    expect(widget.getMany()).toBe(true);

    widget.setUpperBound(-1);
    expect(widget.getMany()).toBe(true);

    // required = lowerBound >= 1, with NO !many check - verified directly
    // against real EMF's ETypedElementImpl.isRequired() source. An
    // earlier version of this formula incorrectly included !many; this
    // specific case (lowerBound=1 AND many=true, i.e. upperBound=-1) is
    // exactly where that bug would have wrongly returned false.
    widget.setLowerBound(0);
    expect(widget.getRequired()).toBe(false);

    widget.setLowerBound(1);
    expect(widget.getRequired()).toBe(true);
    expect(widget.getMany()).toBe(true); // still -1 from above - required AND many, the case the old formula got wrong
  });
});
