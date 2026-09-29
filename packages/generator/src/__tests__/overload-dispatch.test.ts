import { DynamicEFactoryImpl, EAnnotationImpl, EClassImpl, EOperationImpl, EPackageImpl, EParameterImpl, setDetailValue, type EClassifier } from '@typemf/core';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadEcorePackage } from '../ecore-loader.js';
import { generate } from '../generate.js';
import { importCollector } from '../import-collector.js';
import { mergedParamList, overloadDispatch } from '../typescript-filters.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

const GENERATOR = 'https://typemf.dev/generator';
const str = annotatedDataType('EString', 'string');
const int = annotatedDataType('EInt', 'number');
const bool = annotatedDataType('EBoolean', 'boolean');
const eWidget = new EClassImpl();
eWidget.setName('Widget');

/** An operation `name(params...)` returning EString, optionally with a body / dispatch override. */
function op(name: string, params: Array<[string, EClassifier]>, opts: { body?: string; dispatch?: string } = {}): EOperationImpl {
  const o = new EOperationImpl();
  o.setName(name);
  o.setEType(str);
  o.setLowerBound(1);
  for (const [n, t] of params) {
    const p = new EParameterImpl();
    p.setName(n);
    p.setEType(t);
    o.getEParameters().add(p);
  }
  if (opts.body !== undefined || opts.dispatch !== undefined) {
    const a = new EAnnotationImpl();
    a.setSource(GENERATOR);
    if (opts.body !== undefined) setDetailValue(a.getDetails(), 'body', opts.body);
    if (opts.dispatch !== undefined) setDetailValue(a.getDetails(), 'dispatch', opts.dispatch);
    o.getEAnnotations().add(a);
  }
  return o;
}

describe('overload dispatch: deriving the condition', () => {
  it('same arity, different primitive types: typeof on the MERGED parameter name, in declaration order', () => {
    const d = overloadDispatch([op('find', [['featureID', int]], { body: 'return "a";' }), op('find', [['featureName', str]], { body: 'return "b";' })], 'Widget');
    expect(d.stubMessage).toBeUndefined();
    expect(d.branches.map((b) => b.condition)).toEqual(["typeof featureIDOrFeatureName === 'number'", "typeof featureIDOrFeatureName === 'string'"]);
  });

  it('the implementation signature uses the merged names and union types', () => {
    expect(mergedParamList([op('find', [['featureID', int]]), op('find', [['featureName', str]])])).toBe('featureIDOrFeatureName: number | string');
  });

  it('different arity: the extra trailing parameter is optional, and presence selects the overload', () => {
    const group = [op('find', [['name', str]], { body: 'return "one";' }), op('find', [['name', str], ['scope', str]], { body: 'return "two";' })];
    expect(mergedParamList(group)).toBe('name: string, scope?: string');
    expect(overloadDispatch(group, 'Widget').branches.map((b) => b.condition)).toEqual(['scope === undefined', 'scope !== undefined']);
  });

  it('different arity AND different types combine with &&', () => {
    const group = [op('f', [['a', str]], { body: 'return "1";' }), op('f', [['a', int], ['b', bool]], { body: 'return "2";' })];
    expect(mergedParamList(group)).toBe('a: string | number, b?: boolean');
    // Parts follow parameter position; a position the overload lacks must be undefined.
    expect(overloadDispatch(group, 'W').branches.map((b) => b.condition)).toEqual(["typeof a === 'string' && b === undefined", "typeof a === 'number' && b !== undefined"]);
    // b's type is the same wherever it exists (only one overload has it), so presence alone selects.
  });

  it('three overloads', () => {
    const d = overloadDispatch([op('f', [['x', str]], { body: 'return "s";' }), op('f', [['x', int]], { body: 'return "n";' }), op('f', [['x', bool]], { body: 'return "b";' })], 'W');
    expect(d.branches.map((b) => b.condition)).toEqual(["typeof x === 'string'", "typeof x === 'number'", "typeof x === 'boolean'"]);
  });

  it('an explicit `dispatch` detail is used as written and replaces the derived condition', () => {
    const d = overloadDispatch(
      [op('f', [['x', str]], { body: 'return "s";', dispatch: "x.startsWith('#')" }), op('f', [['x', int]], { body: 'return "n";' })],
      'W'
    );
    expect(d.branches.map((b) => b.condition)).toEqual(["x.startsWith('#')", "typeof x === 'number'"]);
  });

  it('an overload without a body still gets a branch - one that throws its own "no body" error', () => {
    const d = overloadDispatch([op('find', [['a', str]], { body: 'return "x";' }), op('find', [['b', int]])], 'Widget');
    expect(d.branches[1]!.body).toBeUndefined();
    expect(d.branches[1]!.label).toBe('Widget.find(b)');
  });
});

describe('overload dispatch: when the group is NOT dispatched (a single throwing stub, saying why)', () => {
  it('no overload has a body', () => {
    expect(overloadDispatch([op('find', [['a', str]]), op('find', [['b', int]])], 'Widget').stubMessage).toBe(
      'Widget.find() is overloaded and none of its overloads has a `body` annotation - nothing to generate.'
    );
  });

  it('a parameter differs by a type with no runtime test (a generated interface) and there is no explicit condition', () => {
    const d = overloadDispatch([op('f', [['x', str]], { body: 'return "s";' }), op('f', [['x', eWidget]], { body: 'return "w";' })], 'W');
    expect(d.branches).toEqual([]);
    expect(d.stubMessage).toMatch(/parameter `x` of W\.f\(x\) has type Widget, which has no runtime test - add a `dispatch` detail/);
  });

  it('...but an explicit condition on that overload makes it dispatchable', () => {
    const d = overloadDispatch(
      [op('f', [['x', str]], { body: 'return "s";' }), op('f', [['x', eWidget]], { body: 'return "w";', dispatch: "typeof x === 'object'" })],
      'W'
    );
    expect(d.stubMessage).toBeUndefined();
  });

  it('two overloads with the same condition cannot be told apart', () => {
    const d = overloadDispatch([op('f', [['x', str]], { body: 'return "1";', dispatch: 'true' }), op('f', [['y', int]], { body: 'return "2";', dispatch: 'true' })], 'W');
    expect(d.stubMessage).toMatch(/same dispatch condition \(true\)/);
  });

  it('identical signatures (nothing distinguishes them) are reported the same way', () => {
    const d = overloadDispatch([op('f', [['x', str]], { body: 'return "1";' }), op('f', [['x', str]], { body: 'return "2";' })], 'W');
    expect(d.stubMessage).toMatch(/cannot be told apart/);
  });
});

describe('overload dispatch: aliases for the overloads\' own parameter names', () => {
  it('emitted only for a name the body actually uses, typed as the overload\'s own parameter type', () => {
    const d = overloadDispatch(
      [op('find', [['featureID', int]], { body: 'return String(featureID);' }), op('find', [['featureName', str]], { body: 'return featureIDOrFeatureName;' })],
      'W'
    );
    expect(d.branches[0]!.aliases).toEqual(['const featureID = featureIDOrFeatureName as number;']);
    expect(d.branches[1]!.aliases).toEqual([]); // its body uses only the merged name; an unused alias would trip noUnusedLocals
  });

  it('none when the own name IS the merged name', () => {
    const d = overloadDispatch([op('f', [['x', str]], { body: 'return x;' }), op('f', [['x', int]], { body: 'return String(x);' })], 'W');
    expect(d.branches.every((b) => b.aliases.length === 0)).toBe(true);
  });

  it('a mention inside a string literal or a comment is not a use (\'by-name:\' does not use `name`)', () => {
    const group = (body: string) => [op('f', [['id', int]], { body: 'return "x";' }), op('f', [['name', str]], { body })];
    expect(overloadDispatch(group("return 'by-name:' + idOrName;"), 'W').branches[1]!.aliases).toEqual([]);
    expect(overloadDispatch(group('return "name" + idOrName; // name'), 'W').branches[1]!.aliases).toEqual([]);
    expect(overloadDispatch(group('/* name */ return idOrName;'), 'W').branches[1]!.aliases).toEqual([]);
  });

  it('but code inside a template literal\'s ${...} IS a use', () => {
    const d = overloadDispatch([op('f', [['id', int]], { body: 'return "x";' }), op('f', [['name', str]], { body: 'return `hello ${name}!`;' })], 'W');
    expect(d.branches[1]!.aliases).toEqual(['const name = idOrName as string;']);
  });

  it('a name that merely CONTAINS the parameter name is not a use of it', () => {
    const d = overloadDispatch([op('f', [['id', int]], { body: 'return "prid";' }), op('f', [['name', str]], { body: 'return "x";' })], 'W');
    expect(d.branches[0]!.aliases).toEqual([]);
  });
});

const ECORE = `<?xml version="1.0" encoding="UTF-8"?>
<ecore:EPackage xmi:version="2.0"
    xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore"
    name="dispatch" nsURI="https://typemf.dev/test/dispatch" nsPrefix="disp">
  <eClassifiers xsi:type="ecore:EDataType" name="EString" instanceClassName="java.lang.String">
    <eAnnotations source="${GENERATOR}"><details key="type" value="string"/></eAnnotations>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EDataType" name="EInt" instanceClassName="int">
    <eAnnotations source="${GENERATOR}"><details key="type" value="number"/></eAnnotations>
  </eClassifiers>
  <eClassifiers xsi:type="ecore:EClass" name="Registry">
    <eStructuralFeatures xsi:type="ecore:EAttribute" name="names" upperBound="-1" eType="#//EString"/>
    <eOperations name="lookup" lowerBound="1" eType="#//EString">
      <eParameters name="index" eType="#//EInt"/>
      <eAnnotations source="${GENERATOR}"><details key="body" value="return 'by-index:' + index + ':' + this.getNames().get(index);"/></eAnnotations>
    </eOperations>
    <eOperations name="lookup" lowerBound="1" eType="#//EString">
      <eParameters name="name" eType="#//EString"/>
      <eAnnotations source="${GENERATOR}"><details key="body" value="return 'by-name:' + indexOrName;"/></eAnnotations>
    </eOperations>
    <eOperations name="describe" lowerBound="1" eType="#//EString">
      <eParameters name="what" eType="#//EString"/>
      <eAnnotations source="${GENERATOR}"><details key="body" value="return 'one:' + what;"/></eAnnotations>
    </eOperations>
    <eOperations name="describe" lowerBound="1" eType="#//EString">
      <eParameters name="what" eType="#//EString"/>
      <eParameters name="detail" eType="#//EString"/>
      <eAnnotations source="${GENERATOR}"><details key="body" value="const joined = what + '/' + detail;&#10;return 'two:' + joined;"/></eAnnotations>
    </eOperations>
    <eOperations name="partial" lowerBound="1" eType="#//EString">
      <eParameters name="n" eType="#//EInt"/>
      <eAnnotations source="${GENERATOR}"><details key="body" value="return 'number';"/></eAnnotations>
    </eOperations>
    <eOperations name="partial" lowerBound="1" eType="#//EString">
      <eParameters name="s" eType="#//EString"/>
    </eOperations>
  </eClassifiers>
</ecore:EPackage>
`;

describe('overload dispatch, end to end from a real .ecore file', () => {
  let dir: string;
  let outDir: string;

  beforeEach(async () => {
    importCollector.clear();
    dir = await mkdtemp(join(tmpdir(), 'typemf-dispatch-'));
    outDir = await mkdtemp(join(dirname(dirname(dirname(fileURLToPath(import.meta.url)))), '.tmp-dispatch-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(outDir, { recursive: true, force: true });
  });

  async function generated() {
    const path = join(dir, 'dispatch.ecore');
    await writeFile(path, ECORE, 'utf-8');
    return generate(await loadEcorePackage(path), typescriptTemplateSet, {});
  }

  it('emits the merged signature, one branch per overload and a final no-match error', async () => {
    const impl = (await generated()).find((f) => f.path === 'impl/RegistryImpl.ts')!.content;
    expect(impl).toContain('lookup(indexOrName: number | string): string {');
    expect(impl).toContain("if (typeof indexOrName === 'number') {");
    expect(impl).toContain("if (typeof indexOrName === 'string') {");
    expect(impl).toContain('const index = indexOrName as number;');
    expect(impl).toContain("throw new Error('Registry.lookup(): no overload matches the given arguments.');");
    expect(impl).toContain('describe(what: string, detail?: string): string {');
    expect(impl).toContain('if (detail === undefined) {');
    expect(impl).toContain('if (detail !== undefined) {');
    expect(impl).toContain("throw new Error('Registry.partial(s) has no `body` annotation - nothing to generate.');");
  });

  it('a multi-line body inside a dispatch branch is indented as a whole, too', async () => {
    const impl = (await generated()).find((f) => f.path === 'impl/RegistryImpl.ts')!.content;
    expect(impl).toContain("    if (detail !== undefined) {\n      const joined = what + '/' + detail;\n      return 'two:' + joined;\n    }");
  });

  it('type-checks with zero errors under strict mode, aliases and all', async () => {
    const files = await generated();
    for (const file of files) {
      const tsPath = join(outDir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
    }
    const program = ts.createProgram(files.map((f) => join(outDir, f.path)), {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      noUnusedLocals: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noEmit: true,
    });
    // noUnusedLocals is on to prove no unused alias is ever emitted. A separate, pre-existing quirk -
    // the package impl imports EEnumImpl even when the metamodel has no enum - is not what is under test.
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter((d) => !(d.code === 6133 && d.file?.fileName.endsWith('impl/DispatchPackageImpl.ts')));
    const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => outDir,
      getCanonicalFileName: (f) => f,
      getNewLine: () => '\n',
    });
    expect(diagnostics, formatted).toHaveLength(0);
  });

  it('the imports a dispatched overload\'s body declares are registered - and an overload with no body registers none', async () => {
    const xml = ECORE.replace(
      `<details key="body" value="return 'one:' + what;"/></eAnnotations>`,
      `<details key="body" value="return pad('one:' + what);"/></eAnnotations>` +
        `<eAnnotations source="${GENERATOR}/import"><details key="type" value="pad"/><details key="internal-from" value="./util/Pad"/></eAnnotations>`
    ).replace(
      `<eParameters name="s" eType="#//EString"/>`,
      `<eParameters name="s" eType="#//EString"/><eAnnotations source="${GENERATOR}/import"><details key="type" value="neverUsed"/><details key="internal-from" value="./util/Never"/></eAnnotations>`
    );
    const path = join(dir, 'imports.ecore');
    await writeFile(path, xml, 'utf-8');
    const impl = generate(await loadEcorePackage(path), typescriptTemplateSet, {}).find((f) => f.path === 'impl/RegistryImpl.ts')!.content;
    expect(impl).toContain("import { pad } from '../util/Pad';");
    expect(impl).toContain("return pad('one:' + what);");
    expect(impl).not.toContain('neverUsed');
  });

  it('actually RUNS: each call reaches the body of the overload its arguments select', async () => {
    const files = await generated();
    const jsPaths = new Map<string, string>();
    for (const file of files) {
      const jsPath = join(outDir, file.path.replace(/\.ts$/, '.js'));
      await mkdir(dirname(jsPath), { recursive: true });
      const { outputText } = ts.transpileModule(file.content, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
      await writeFile(jsPath, outputText, 'utf-8');
      jsPaths.set(file.path, jsPath);
    }
    const { DispatchFactoryImpl } = (await import(jsPaths.get('impl/DispatchFactoryImpl.ts')!)) as { DispatchFactoryImpl: new () => { create(c: unknown): unknown } };
    const { DispatchPackageImpl } = (await import(jsPaths.get('impl/DispatchPackageImpl.ts')!)) as { DispatchPackageImpl: { eINSTANCE: { getRegistry(): unknown } } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registry: any = new DispatchFactoryImpl().create(DispatchPackageImpl.eINSTANCE.getRegistry());
    registry.getNames().add('zero');
    registry.getNames().add('one');

    expect(registry.lookup(1)).toBe('by-index:1:one'); // same arity, dispatched on number
    expect(registry.lookup('one')).toBe('by-name:one'); // ... and on string
    expect(registry.describe('x')).toBe('one:x'); // different arity, dispatched on presence
    expect(registry.describe('x', 'y')).toBe('two:x/y');
    expect(registry.partial(5)).toBe('number'); // an overload with a body
    expect(() => registry.partial('s')).toThrow(/Registry\.partial\(s\) has no `body` annotation/); // one without
    expect(() => registry.lookup(true)).toThrow(/no overload matches/); // matches none
  });
});
