import {
  DynamicEFactoryImpl,
  EAnnotationImpl,
  EAttributeImpl,
  EClassImpl,
  EPackageImpl,
  EReferenceImpl,
  setDetailValue,
  type EClassifier,
} from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

const GET_SOURCE = 'https://typemf.dev/generator/feature';
const IMPORT_SOURCE = 'https://typemf.dev/generator/import';

function annotate(target: EReferenceImpl | EAttributeImpl, source: string, details: Record<string, string>): void {
  const existing = [...target.getEAnnotations()].find((a) => a.getSource() === source);
  const a = existing ?? new EAnnotationImpl();
  a.setSource(source);
  for (const [k, v] of Object.entries(details)) setDetailValue(a.getDetails(), k, v);
  if (!existing) target.getEAnnotations().add(a);
}

/**
 * MetaClass has `superTypes` and `operations`, and a derived `allOperations` with a custom getter
 * shaped like Ecore's eAllOperations.
 */
function buildMetaModel() {
  const str = annotatedDataType('EString', 'string');
  const metaOperation = new EClassImpl();
  metaOperation.setName('MetaOperation');
  const opName = new EAttributeImpl();
  opName.setName('name');
  opName.setEType(str);
  opName.setFeatureID(0);
  opName.setEContainingClass(metaOperation);
  metaOperation.getEStructuralFeatures().add(opName);

  const metaClass = new EClassImpl();
  metaClass.setName('MetaClass');

  const superTypes = new EReferenceImpl();
  superTypes.setName('superTypes');
  superTypes.setEType(metaClass);
  superTypes.setUpperBound(-1);
  superTypes.setFeatureID(0);
  superTypes.setEContainingClass(metaClass);
  metaClass.getEStructuralFeatures().add(superTypes);

  const operations = new EReferenceImpl();
  operations.setName('operations');
  operations.setEType(metaOperation);
  operations.setUpperBound(-1);
  operations.setContainment(true);
  operations.setFeatureID(1);
  operations.setEContainingClass(metaClass);
  metaClass.getEStructuralFeatures().add(operations);

  const allOperations = new EReferenceImpl();
  allOperations.setName('allOperations');
  allOperations.setEType(metaOperation);
  allOperations.setUpperBound(-1);
  allOperations.setChangeable(false);
  allOperations.setFeatureID(2);
  allOperations.setEContainingClass(metaClass);
  annotate(allOperations, GET_SOURCE, {
    get: `const collected = new Set<MetaOperation>();
const visited = new Set<MetaClass>();
const visit = (metaClass: MetaClass): void => {
  if (visited.has(metaClass)) return;
  visited.add(metaClass);
  metaClass.getSuperTypes().forEach(visit);
  metaClass.getOperations().forEach(operation => collected.add(operation));
};
visit(this);
return new BasicEList<MetaOperation>(undefined, undefined, collected);`,
  });
  annotate(allOperations, IMPORT_SOURCE, { type: 'BasicEList', from: '@typemf/core' });
  metaClass.getEStructuralFeatures().add(allOperations);

  const pkg = new EPackageImpl();
  pkg.setName('meta');
  pkg.setNsURI('https://typemf.dev/test/meta');
  pkg.setNsPrefix('meta');
  for (const c of [str, metaOperation, metaClass] as EClassifier[]) {
    pkg.getEClassifiers().add(c);
    (c as EClassImpl).setEPackage(pkg);
  }
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());
  return pkg;
}

describe('a many-valued derived reference with a custom getter', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-eall-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('type-checks', async () => {
    const files = generate(buildMetaModel(), typescriptTemplateSet, {});
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
  });

  it('returns inherited operations before own ones, each once', async () => {
    const files = generate(buildMetaModel(), typescriptTemplateSet, {});
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
    const { MetaFactoryImpl } = (await import(jsPaths.get('impl/MetaFactoryImpl.ts')!)) as {
      MetaFactoryImpl: new () => { create(c: unknown): unknown };
    };
    const { MetaPackageImpl } = (await import(jsPaths.get('impl/MetaPackageImpl.ts')!)) as {
      MetaPackageImpl: { eINSTANCE: { getMetaClass(): unknown; getMetaOperation(): unknown } };
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factory: any = new MetaFactoryImpl();
    const pkg = MetaPackageImpl.eINSTANCE;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const base: any = factory.create(pkg.getMetaClass());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const middle: any = factory.create(pkg.getMetaClass());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const leaf: any = factory.create(pkg.getMetaClass());
    middle.getSuperTypes().add(base);
    leaf.getSuperTypes().add(middle);

    const mkOp = (name: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const op: any = factory.create(pkg.getMetaOperation());
      op.setName(name);
      return op;
    };
    base.getOperations().add(mkOp('baseOp'));
    middle.getOperations().add(mkOp('middleOp'));
    leaf.getOperations().add(mkOp('leafOp'));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const names = (metaClass: any) => [...metaClass.getAllOperations()].map((op: any) => op.getName());
    expect(names(base)).toEqual(['baseOp']);
    expect(names(middle)).toEqual(['baseOp', 'middleOp']);
    expect(names(leaf)).toEqual(['baseOp', 'middleOp', 'leafOp']);

    // Diamond: baseOp is reachable through both middles.
    const leftMiddle: any = factory.create(pkg.getMetaClass()); // eslint-disable-line @typescript-eslint/no-explicit-any
    const rightMiddle: any = factory.create(pkg.getMetaClass()); // eslint-disable-line @typescript-eslint/no-explicit-any
    leftMiddle.getSuperTypes().add(base);
    rightMiddle.getSuperTypes().add(base);
    leftMiddle.getOperations().add(mkOp('leftOp'));
    rightMiddle.getOperations().add(mkOp('rightOp'));
    const diamond: any = factory.create(pkg.getMetaClass()); // eslint-disable-line @typescript-eslint/no-explicit-any
    diamond.getSuperTypes().add(leftMiddle);
    diamond.getSuperTypes().add(rightMiddle);
    expect(names(diamond)).toEqual(['baseOp', 'leftOp', 'rightOp']);
  });

  it('caches the result until the model changes', async () => {
    const files = generate(buildMetaModel(), typescriptTemplateSet, {});
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
    const { MetaFactoryImpl } = (await import(jsPaths.get('impl/MetaFactoryImpl.ts')!)) as {
      MetaFactoryImpl: new () => { create(c: unknown): unknown };
    };
    const { MetaPackageImpl } = (await import(jsPaths.get('impl/MetaPackageImpl.ts')!)) as {
      MetaPackageImpl: { eINSTANCE: { getMetaClass(): unknown; getMetaOperation(): unknown } };
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factory: any = new MetaFactoryImpl();
    const pkg = MetaPackageImpl.eINSTANCE;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const base: any = factory.create(pkg.getMetaClass());
    base.getOperations().add(
      (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const op: any = factory.create(pkg.getMetaOperation());
        op.setName('baseOp');
        return op;
      })()
    );

    const first = base.getAllOperations();
    const second = base.getAllOperations();
    expect(second).toBe(first);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const other: any = factory.create(pkg.getMetaClass());
    other.getOperations().add(
      (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const op: any = factory.create(pkg.getMetaOperation());
        op.setName('otherOp');
        return op;
      })()
    );
    // Any model change invalidates the cache, even on an unrelated object.
    const third = base.getAllOperations();
    expect(third).not.toBe(first);
    expect([...third].map((op: { getName(): string }) => op.getName())).toEqual(['baseOp']);
  });
});
