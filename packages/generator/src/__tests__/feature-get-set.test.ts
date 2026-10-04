import {
  EAnnotationImpl,
  EAttributeImpl,
  EClassImpl,
  EPackageImpl,
  setDetailValue,
  type EClassifier,
  type EStructuralFeature,
} from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import {
  featureGetter,
  featureSetter,
  findFeatureAnnotationProblems,
  isReadOnlyFeature,
} from '../typescript-filters.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

const GENERATOR = 'https://typemf.dev/generator';
const FEATURE = 'https://typemf.dev/generator/feature';
const IMPORT = 'https://typemf.dev/generator/import';

function annotate(target: EStructuralFeature, source: string, details: Record<string, string>): void {
  // `get` and `set` must be details of the same annotation.
  const existing = [...target.getEAnnotations()].find((a) => a.getSource() === source);
  const a = existing ?? new EAnnotationImpl();
  a.setSource(source);
  for (const [k, v] of Object.entries(details)) setDetailValue(a.getDetails(), k, v);
  if (!existing) target.getEAnnotations().add(a);
}

const str = annotatedDataType('EString', 'string');

function feature(name: string, opts: { many?: boolean; get?: string; set?: string } = {}): EAttributeImpl {
  const f = new EAttributeImpl();
  f.setName(name);
  f.setEType(str);
  if (opts.many) f.setUpperBound(-1);
  if (opts.get !== undefined) annotate(f, FEATURE, { get: opts.get });
  if (opts.set !== undefined) annotate(f, FEATURE, { set: opts.set });
  return f;
}

describe('featureGetter / featureSetter: reading the annotation', () => {
  it('reads `get` and `set` from the https://typemf.dev/generator/feature source', () => {
    const f = feature('x', { get: 'return 1;', set: 'this.raw = value;' });
    expect(featureGetter(f)).toBe('return 1;');
    expect(featureSetter(f)).toBe('this.raw = value;');
  });

  it('an empty value counts as absent', () => {
    const f = feature('x', { get: '' });
    expect(featureGetter(f)).toBeUndefined();
  });

  it('ignores `get` and `set` in other annotation sources', () => {
    const f = new EAttributeImpl();
    f.setName('x');
    annotate(f, GENERATOR, { get: 'ignored', set: 'ignored' });
    annotate(f, 'http://www.eclipse.org/emf/2002/GenModel', { get: 'ignored', set: 'ignored' });
    expect(featureGetter(f)).toBeUndefined();
    expect(featureSetter(f)).toBeUndefined();
  });

  it('isReadOnlyFeature is true only for a getter without a setter', () => {
    expect(isReadOnlyFeature(feature('x', { get: 'return 1;' }))).toBe(true);
    expect(isReadOnlyFeature(feature('x', { get: 'return 1;', set: 'this.raw = value;' }))).toBe(false);
    expect(isReadOnlyFeature(feature('x'))).toBe(false);
  });
});

describe('findFeatureAnnotationProblems', () => {
  function pkgWith(f: EAttributeImpl) {
    const c = new EClassImpl();
    c.setName('C');
    f.setEContainingClass(c);
    c.getEStructuralFeatures().add(f);
    const p = new EPackageImpl();
    p.setName('p');
    p.setNsURI('u');
    p.setNsPrefix('p');
    for (const x of [str, c] as EClassifier[]) {
      p.getEClassifiers().add(x);
      (x as EClassImpl).setEPackage(p);
    }
    return p;
  }

  it('reports a `set` on a many-valued feature', () => {
    const problems = findFeatureAnnotationProblems(pkgWith(feature('tags', { many: true, set: 'this.raw = value;' })));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/C\.tags.*set.*many-valued/);
  });

  it('accepts a `set` on a single-valued and a `get` on a many-valued feature', () => {
    expect(findFeatureAnnotationProblems(pkgWith(feature('title', { set: 'this.raw = value;' })))).toEqual([]);
    expect(findFeatureAnnotationProblems(pkgWith(feature('tags', { many: true, get: 'return this._x;' })))).toEqual([]);
  });
});

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
const GET = (body: string) =>
  `<eAnnotations source="${FEATURE}"><details key="get" value="${xmlEscape(body)}"/></eAnnotations>`;
const GET_SET = (get: string, set: string) =>
  `<eAnnotations source="${FEATURE}"><details key="get" value="${xmlEscape(get)}"/><details key="set" value="${xmlEscape(set)}"/></eAnnotations>`;
const IMP = (type: string, from: string) =>
  `<eAnnotations source="${IMPORT}"><details key="type" value="${type}"/><details key="internal-from" value="${from}"/></eAnnotations>`;

function model(features: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="fs" nsURI="https://typemf.dev/test/fs" nsPrefix="fs">
  <eClassifiers xsi:type="ecore:EDataType" name="EString" instanceClassName="java.lang.String">
    <eAnnotations source="${GENERATOR}"><details key="type" value="string"/></eAnnotations>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EDataType" name="EInt" instanceClassName="int">
    <eAnnotations source="${GENERATOR}"><details key="type" value="number"/></eAnnotations>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Box">${features}
  </eClassifiers>
</ecore:EPackage>
`;
}

describe('generated code for custom getters and setters', () => {
  let dir: string;
  let outDir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'typemf-fs-'));
    outDir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-fs-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  });

  async function generated(xml: string, options: Record<string, unknown> = {}) {
    const path = join(dir, 'fs.ecore');
    await writeFile(path, xml, 'utf-8');
    const files = generate(await loadEcorePackage(path), typescriptTemplateSet, options);
    return { files, content: (p: string) => files.find((f) => f.path === p)!.content };
  }

  it('single-valued with get: no field and no setter; eGet calls the getter', async () => {
    const xml = model(`
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="raw" eType="#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="shout" eType="#//EString">${GET("return (this.getRaw() ?? '').toUpperCase();")}</eStructuralFeatures>`);
    const { content } = await generated(xml);
    const iface = content('types/Box.ts');
    const impl = content('impl/BoxImpl.ts');
    expect(iface).toContain('getShout(): string | undefined;');
    expect(iface).not.toContain('setShout');
    expect(impl).not.toMatch(/_shout\b/);
    expect(impl).toContain("return (this.getRaw() ?? '').toUpperCase();");
    expect(impl).toMatch(/case \d+: return this\.getShout\(\);/);
    const eSetBlock = impl.slice(impl.indexOf('eSet(feature'), impl.indexOf('eBasicSetValue('));
    expect(eSetBlock).not.toContain('Shout');
    const eUnsetBlock = impl.slice(impl.indexOf('eUnset(feature'));
    expect(eUnsetBlock).not.toContain('Shout');
  });

  it('single-valued with get and set: eSet calls the setter, eIsSet the getter', async () => {
    const xml = model(`
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="raw" eType="#//EString"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="shout" eType="#//EString">${GET_SET('return this.getRaw();', "this.setRaw((value ?? '').toLowerCase());")}</eStructuralFeatures>`);
    const { content } = await generated(xml);
    const iface = content('types/Box.ts');
    const impl = content('impl/BoxImpl.ts');
    expect(iface).toContain('setShout(value: string | undefined): void;');
    expect(impl).toContain("this.setRaw((value ?? '').toLowerCase());");
    expect(impl).toMatch(/case \d+: \{\s*this\.setShout\(value as string \| undefined\);\s*return;\s*\}/);
    expect(impl).toMatch(/case \d+: return this\.getShout\(\) !== undefined;/);
  });

  it('many-valued with get: a cache instead of a field; eIsSet uses size()', async () => {
    const xml = model(`
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="raw" eType="#//EString" upperBound="-1"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="upper" eType="#//EString" upperBound="-1">${GET(
      'const result = new Set<string>();\nfor (const r of this.getRaw()) result.add(r.toUpperCase());\nreturn new BasicEList<string>(undefined, undefined, result);'
    )}${IMP('BasicEList', './impl/BasicEList.js')}</eStructuralFeatures>`);
    const { content } = await generated(xml, { 'generate-ecore': true });
    const impl = content('impl/BoxImpl.ts');
    expect(impl).not.toMatch(/private get _upper\(\)/);
    expect(impl).toMatch(/private _upperCache: EList<string> \| undefined;/);
    expect(impl).toMatch(/private _upperCacheGeneration = -1;/);
    expect(impl).toContain('for (const r of this.getRaw()) result.add(r.toUpperCase());');
    expect(impl).toMatch(/if \(this\._upperCacheGeneration !== EObjectImpl\.getModelGeneration\(\)\)/);
    expect(impl).toMatch(/case \d+: return this\.getUpper\(\);/);
    expect(impl).toMatch(/case \d+: return this\.getUpper\(\)\.size\(\) !== 0;/);
    expect(impl).toContain("import { BasicEList } from './BasicEList.js';");
  });

  it('a feature without get or set is backed by a field', async () => {
    const xml = model(`<eStructuralFeatures xsi:type="ecore:EAttribute" name="plain" eType="#//EString"/>`);
    const { content } = await generated(xml);
    const impl = content('impl/BoxImpl.ts');
    expect(impl).toContain('private _plain: string | undefined;');
    expect(impl).toMatch(/case \d+: return this\._plain;/);
  });

  it('eGet calls the getter of a derived feature with a built-in formula', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore" name="fs2" nsURI="https://typemf.dev/test/fs2" nsPrefix="fs2">
  <eClassifiers xsi:type="ecore:EDataType" name="EInt" instanceClassName="int"><eAnnotations source="${GENERATOR}"><details key="type" value="number"/></eAnnotations></eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Widget">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="count" eType="#//EInt" upperBound="-1"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="many" eType="#//EInt" derived="true" changeable="false"/>
  </eClassifiers>
</ecore:EPackage>`;
    const impl = (await generated(xml)).content('impl/WidgetImpl.ts');
    expect(impl).toMatch(/case \d+: return this\.getMany\(\);/);
  });

  it('type-checks and runs the custom getters and setters', async () => {
    const xml = model(`
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="raw" eType="#//EString" upperBound="-1"/>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="count" eType="#//EInt">${GET('return this.getRaw().size();')}</eStructuralFeatures>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="label" eType="#//EString">${GET_SET('return this.getRaw2();', "this.setRaw2((value ?? '').trim());")}</eStructuralFeatures>
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="raw2" eType="#//EString"/>`);
    const { files } = await generated(xml);

    for (const file of files) {
      const tsPath = join(outDir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
    }
    const program = ts.createProgram(
      files.map((f) => join(outDir, f.path)),
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
      getCurrentDirectory: () => outDir,
      getCanonicalFileName: (f) => f,
      getNewLine: () => '\n',
    });
    expect(diagnostics, formatted).toHaveLength(0);

    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const jsPath = join(outDir, file.path.replace(/\.ts$/, '.js'));
      const { outputText } = ts.transpileModule(file.content, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }
    const { FsFactoryImpl } = (await import(jsPaths.get('impl/FsFactoryImpl.ts')!)) as {
      FsFactoryImpl: new () => { create(c: unknown): unknown };
    };
    const { FsPackageImpl } = (await import(jsPaths.get('impl/FsPackageImpl.ts')!)) as {
      FsPackageImpl: { eINSTANCE: { getBox(): unknown } };
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const box: any = new FsFactoryImpl().create(FsPackageImpl.eINSTANCE.getBox());
    box.getRaw().add('a');
    box.getRaw().add('b');
    expect(box.getCount()).toBe(2);
    expect(box.getLabel()).toBeUndefined();
    box.setLabel('  Hello  ');
    expect(box.getLabel()).toBe('Hello');
    expect(box.getRaw2()).toBe('Hello');
  });
});
