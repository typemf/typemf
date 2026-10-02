import {
  DynamicEFactoryImpl,
  EAnnotationImpl,
  EAttributeImpl,
  EClassImpl,
  EcorePackageImpl,
  EDataTypeImpl,
  EGenericTypeImpl,
  EOperationImpl,
  EPackageImpl,
  EParameterImpl,
  ETypeParameterImpl,
  setDetailValue,
  type EClassifier,
  type EGenericType,
} from '@typemf/core';

// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { importCollector } from '../import-collector.js';
import {
  genericArgumentClassifiers,
  referencedApiTypes,
  resolveDataTypeTs,
  tsOperationReturnType,
  tsOptionalScalarType,
  tsScalarType,
} from '../typescript-filters.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

const GENERATOR = 'https://typemf.dev/generator';
const IMPORT = 'https://typemf.dev/generator/import';

function dataType(
  name: string,
  opts: { instanceClassName?: string; annotation?: Record<string, string>; typeParameters?: string[] } = {}
): EDataTypeImpl {
  const dt = new EDataTypeImpl();
  dt.setName(name);
  if (opts.instanceClassName !== undefined) dt.setInstanceClassName(opts.instanceClassName);
  // `type` goes into the generator annotation; with `from` or `internal-from`, the details also form
  // the import annotation.
  if (opts.annotation) {
    const { type, ...rest } = opts.annotation;
    if (type !== undefined) {
      const text = new EAnnotationImpl();
      text.setSource(GENERATOR);
      setDetailValue(text.getDetails(), 'type', type);
      dt.getEAnnotations().add(text);
    }
    if ('from' in rest || 'internal-from' in rest) {
      const imp = new EAnnotationImpl();
      imp.setSource(IMPORT);
      for (const [k, v] of Object.entries(opts.annotation)) setDetailValue(imp.getDetails(), k, v);
      dt.getEAnnotations().add(imp);
    }
  }
  for (const parameterName of opts.typeParameters ?? []) {
    const p = new ETypeParameterImpl();
    p.setName(parameterName);
    dt.getETypeParameters().add(p);
  }
  return dt;
}

const str = () => dataType('EString', { annotation: { type: 'string' } });

/** A generic type: `classifier<args...>`; an `undefined` argument is an unbound one (`<eTypeArguments/>`). */
function generic(
  classifier: EClassifier | undefined,
  ...args: Array<EGenericType | EClassifier | undefined>
): EGenericTypeImpl {
  const gt = new EGenericTypeImpl();
  if (classifier) gt.setEClassifier(classifier);
  for (const arg of args) {
    if (arg instanceof EGenericTypeImpl) gt.getETypeArguments().add(arg);
    else gt.getETypeArguments().add(generic(arg as EClassifier | undefined));
  }
  return gt;
}

function attrTyped(name: string, gt: EGenericTypeImpl): EAttributeImpl {
  const a = new EAttributeImpl();
  a.setName(name);
  a.setEGenericType(gt);
  return a;
}

describe('EDataType resolution', () => {
  afterEach(() => importCollector.clear());

  it('uses the type annotation over instanceClassName and the name', () => {
    const dt = dataType('EString', { instanceClassName: 'java.lang.String', annotation: { type: 'MyString' } });
    expect(resolveDataTypeTs(dt)).toEqual({ text: 'MyString' });
  });

  it('emits the type annotation as written', () => {
    expect(tsScalarType(dataType('EIntegerObject', { annotation: { type: 'number | undefined' } }))).toBe(
      'number | undefined'
    );
    expect(tsScalarType(dataType('EByteArray', { annotation: { type: 'number []' } }))).toBe('number []');
    expect(importCollector.isEmpty()).toBe(true);
  });

  it('registers no import for a type annotation without internal-from', () => {
    expect(tsScalarType(dataType('EJavaObject', { annotation: { type: 'unknown' } }))).toBe('unknown');
    expect(importCollector.isEmpty()).toBe(true);
  });

  it('registers an import for a type annotation with internal-from', () => {
    const dt = dataType('EMoney', { annotation: { type: 'Money', 'internal-from': './types/Money' } });
    expect(tsScalarType(dt)).toBe('Money');
    expect(importCollector.render('root', {})).toBe("import { Money } from './types/Money';");
  });

  it('resolves a relative internal-from against the package root for each importing folder', () => {
    tsScalarType(dataType('EMoney', { annotation: { type: 'Money', 'internal-from': './types/Money.js' } }));
    expect(importCollector.render('root', {})).toContain("from './types/Money.js'");
    expect(importCollector.render('types', {})).toContain("from './Money.js'");
    expect(importCollector.render('impl', {})).toContain("from '../types/Money.js'");
    expect(importCollector.render('util', {})).toContain("from '../types/Money.js'");
  });

  it('uses a non-relative internal-from as written in every folder', () => {
    tsScalarType(dataType('EBig', { annotation: { type: 'Big', from: 'big.js' } }));
    for (const location of ['root', 'types', 'impl', 'util'] as const) {
      expect(importCollector.render(location, {})).toBe("import { Big } from 'big.js';");
    }
  });

  it('uses instanceClassName as written when there is no annotation', () => {
    expect(resolveDataTypeTs(dataType('EString', { instanceClassName: 'java.lang.String' })).text).toBe(
      'java.lang.String'
    );
    expect(resolveDataTypeTs(dataType('EInt', { instanceClassName: 'int' })).text).toBe('int');
  });

  it('prefers instanceClassName over the name', () => {
    expect(resolveDataTypeTs(dataType('EString', { instanceClassName: 'Whatever' })).text).toBe('Whatever');
  });

  it('uses the name as written otherwise, also for EString', () => {
    for (const name of ['EString', 'EInt', 'EBoolean', 'EDate', 'ECustom']) {
      expect(resolveDataTypeTs(dataType(name)).text).toBe(name);
    }
  });

  it('an empty annotation value or instanceClassName counts as absent', () => {
    expect(resolveDataTypeTs(dataType('EX', { annotation: { type: '' }, instanceClassName: '' })).text).toBe('EX');
  });

  it('an annotation with a different source is ignored', () => {
    const dt = dataType('EX');
    const other = new EAnnotationImpl();
    other.setSource('http://example.com/other');
    setDetailValue(other.getDetails(), 'type', 'Nope');
    dt.getEAnnotations().add(other);
    expect(resolveDataTypeTs(dt).text).toBe('EX');
  });

  it('the same resolution applies to an operation return type', () => {
    const op = new EOperationImpl();
    op.setName('total');
    op.setEType(dataType('EMoney', { annotation: { type: 'Money', 'internal-from': './types/Money' } }));
    op.setLowerBound(1);
    expect(tsOperationReturnType(op)).toBe('Money');
    expect(importCollector.render('impl', {})).toContain("import { Money } from '../types/Money';");
  });

  it('never emits `unknown | undefined`', () => {
    const json = dataType('EJavaObject', { annotation: { type: 'unknown' } });
    const op = new EOperationImpl();
    op.setName('anything');
    op.setEType(json);
    expect(tsOperationReturnType(op)).toBe('unknown');
    expect(tsOptionalScalarType(json)).toBe('unknown');
    expect(tsOptionalScalarType(str())).toBe('string | undefined');
  });

  it('emits and imports EObject for a feature without a type', () => {
    expect(tsScalarType(undefined)).toBe('EObject');
    expect(importCollector.render('impl', {})).toBe("import { EObject } from '@typemf/core';");
    expect(importCollector.render('impl', { 'generate-ecore': true })).toBe(
      "import { EObject } from '../types/EObject.js';"
    );
  });
});

describe('import collector: one name, several requests', () => {
  afterEach(() => importCollector.clear());

  it('two datatypes importing from the same module produce one merged import statement', () => {
    tsScalarType(dataType('EA', { annotation: { type: 'A', 'internal-from': './types/Shared' } }));
    tsScalarType(dataType('EB', { annotation: { type: 'B', 'internal-from': './types/Shared' } }));
    expect(importCollector.render('impl', {})).toBe("import { A, B } from '../types/Shared';");
  });

  it('reports the same name from different modules as a collision', () => {
    tsScalarType(dataType('EA', { annotation: { type: 'Thing', 'internal-from': './types/One' } }));
    tsScalarType(dataType('EB', { annotation: { type: 'Thing', 'internal-from': './types/Two' } }));
    expect(() => importCollector.render('impl', {})).toThrow(/"Thing" was requested from .*One.* and .*Two/);
  });

  it('merges an annotation import and a template import of the same module in generate-ecore mode', () => {
    tsScalarType(dataType('EEList', { annotation: { type: 'EList', 'internal-from': './types/EList' } }));
    importCollector.add({ name: 'EList', location: 'types', foundational: true });
    // Spelled without ".js" by the annotation, with it by the template - still the one module.
    expect(importCollector.render('impl', { 'generate-ecore': true })).toBe("import { EList } from '../types/EList';");
    expect(importCollector.render('types', { 'generate-ecore': true })).toBe("import { EList } from './EList';");
  });

  it("reports a collision in ordinary mode, where the template's EList comes from @typemf/core", () => {
    tsScalarType(dataType('EEList', { annotation: { type: 'EList', 'internal-from': './types/EList' } }));
    importCollector.add({ name: 'EList', location: 'types', foundational: true });
    expect(() => importCollector.render('impl', {})).toThrow(/"EList" was requested from/);
  });
});

describe('generic datatypes: type parameters and type arguments', () => {
  afterEach(() => importCollector.clear());

  const javaClass = () =>
    dataType('EJavaClass', {
      annotation: { type: 'TypeScriptClass', 'internal-from': './types/TypeScriptClass' },
      typeParameters: ['T'],
    });

  it('without a generic type every parameter is unknown', () => {
    const attr = new EAttributeImpl();
    attr.setEType(javaClass());
    expect(tsScalarType(attr)).toBe('TypeScriptClass<unknown>');
  });

  it('an empty type argument is unknown', () => {
    expect(tsScalarType(attrTyped('a', generic(javaClass(), undefined)))).toBe('TypeScriptClass<unknown>');
  });

  it('a bound type argument becomes the template argument, through its own datatype resolution', () => {
    expect(tsScalarType(attrTyped('a', generic(javaClass(), str())))).toBe('TypeScriptClass<string>');
  });

  it("a bound EClass argument is the class's name", () => {
    const c = new EClassImpl();
    c.setName('Refund');
    expect(tsScalarType(attrTyped('a', generic(javaClass(), c)))).toBe('TypeScriptClass<Refund>');
  });

  it('type arguments nest: EEList<EJavaClass<EString>>', () => {
    const eelist = dataType('EEList', {
      annotation: { type: 'EList', 'internal-from': './types/EList' },
      typeParameters: ['E'],
    });
    expect(tsScalarType(attrTyped('a', generic(eelist, generic(javaClass(), str()))))).toBe(
      'EList<TypeScriptClass<string>>'
    );
  });

  it('several parameters are filled positionally; missing or unbound ones are unknown', () => {
    const emap = dataType('EMap', { annotation: { type: 'EMap' }, typeParameters: ['K', 'V'] });
    expect(tsScalarType(attrTyped('a', generic(emap, str())))).toBe('EMap<string, unknown>');
    expect(tsScalarType(attrTyped('a', generic(emap, undefined, str())))).toBe('EMap<unknown, string>');
    expect(tsScalarType(attrTyped('a', generic(emap, str(), str())))).toBe('EMap<string, string>');
  });

  it("a type argument that refers to an enclosing type parameter is that parameter's name", () => {
    const eelist = dataType('EEList', { annotation: { type: 'EList' }, typeParameters: ['E'] });
    const outerParam = new ETypeParameterImpl();
    outerParam.setName('T');
    const arg = new EGenericTypeImpl();
    arg.setETypeParameter(outerParam);
    const gt = new EGenericTypeImpl();
    gt.setEClassifier(eelist);
    gt.getETypeArguments().add(arg);
    expect(tsScalarType(attrTyped('a', gt))).toBe('EList<T>');
  });

  it('a non-generic classifier never gets type arguments, even if a generic type supplies some', () => {
    expect(tsScalarType(attrTyped('a', generic(str(), str())))).toBe('string');
  });

  it('the same generic text applies to operation return types and parameters (and | undefined still applies)', () => {
    const op = new EOperationImpl();
    op.setName('kind');
    op.setEGenericType(generic(javaClass(), str()));
    expect(tsOperationReturnType(op)).toBe('TypeScriptClass<string> | undefined');
    const param = new EParameterImpl();
    param.setName('p');
    param.setEGenericType(generic(javaClass()));
    expect(tsScalarType(param)).toBe('TypeScriptClass<unknown>');
  });

  it("emitting a generic datatype registers its own import once, and the argument datatypes' imports too", () => {
    const money = dataType('EMoney', { annotation: { type: 'Money', 'internal-from': './types/Money' } });
    tsScalarType(attrTyped('a', generic(javaClass(), money)));
    expect(importCollector.render('impl', {})).toBe(
      ["import { Money } from '../types/Money';", "import { TypeScriptClass } from '../types/TypeScriptClass';"].join(
        '\n'
      )
    );
  });

  it('classes/enums bound inside type arguments are reported for import (referencedApiTypes), at any depth', () => {
    const refund = new EClassImpl();
    refund.setName('Refund');
    const eelist = dataType('EEList', { annotation: { type: 'EList' }, typeParameters: ['E'] });
    const attr = attrTyped('a', generic(eelist, generic(javaClass(), refund)));
    expect(genericArgumentClassifiers(attr.getEGenericType()).map((c) => c.getName())).toEqual([
      'EJavaClass',
      'Refund',
    ]);
    expect(referencedApiTypes([attr])).toEqual(['Refund']);
    expect(referencedApiTypes([attr], 'Refund')).toEqual([]);
  });
});

function buildPaymentMetamodel() {
  const eStringType = str();
  const money = dataType('EMoney', { annotation: { type: 'Money', 'internal-from': './types/Money.js' } });
  const json = dataType('EJsonValue', { annotation: { type: 'unknown' } });
  const instant = dataType('EInstant', { annotation: { type: 'Date' } });
  const javaClass = dataType('EJavaClass', {
    annotation: { type: 'TypeScriptClass', 'internal-from': './types/TypeScriptClass.js' },
    typeParameters: ['T'],
  });

  const refund = new EClassImpl();
  refund.setName('Refund');

  const payment = new EClassImpl();
  payment.setName('Payment');
  let id = 0;
  const add = (a: EAttributeImpl, upper = 1) => {
    a.setUpperBound(upper);
    a.setFeatureID(id++);
    a.setEContainingClass(payment);
    payment.getEStructuralFeatures().add(a);
  };
  const attr = (name: string, type: EClassifier, upper = 1) => {
    const a = new EAttributeImpl();
    a.setName(name);
    a.setEType(type);
    add(a, upper);
  };
  attr('amount', money);
  attr('payload', json);
  attr('at', instant);
  attr('history', money, -1);
  attr('raw', javaClass); // no type argument at all
  add(attrTyped('refundType', generic(javaClass, refund))); // EJavaClass<Refund>
  add(attrTyped('anyType', generic(javaClass, undefined))); // EJavaClass<> - explicitly unbound
  add(attrTyped('nameType', generic(javaClass, eStringType))); // EJavaClass<EString>

  const convert = new EOperationImpl();
  convert.setName('convert');
  convert.setEType(money);
  convert.setLowerBound(1);
  const target = new EParameterImpl();
  target.setName('target');
  target.setEType(money);
  convert.getEParameters().add(target);
  const kindOf = new EOperationImpl();
  kindOf.setName('kindOf');
  kindOf.setLowerBound(1);
  kindOf.setEGenericType(generic(javaClass, refund));
  payment.getEOperations().add(convert);
  payment.getEOperations().add(kindOf);

  const pkg = new EPackageImpl();
  pkg.setName('payments');
  pkg.setNsURI('https://typemf.dev/samples/payments');
  pkg.setNsPrefix('pay');
  for (const c of [eStringType, money, json, instant, javaClass, refund, payment]) pkg.getEClassifiers().add(c);
  for (const c of pkg.getEClassifiers()) (c as EClassImpl).setEPackage(pkg);
  pkg.setEFactoryInstance(new DynamicEFactoryImpl());
  return pkg;
}

describe('EDataType resolution in generated code', () => {
  let dir: string;

  beforeEach(async () => {
    const packageDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
    dir = await mkdtemp(join(packageDir, '.tmp-datatypes-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('emits the resolved type for attributes, operation returns and parameters', () => {
    const files = generate(buildPaymentMetamodel(), typescriptTemplateSet, {});
    const types = files.find((f) => f.path === 'types/Payment.ts')!.content;
    const impl = files.find((f) => f.path === 'impl/PaymentImpl.ts')!.content;

    expect(types).toContain('getAmount(): Money | undefined;');
    expect(types).toContain('getPayload(): unknown;');
    expect(types).toContain('getAt(): Date | undefined;');
    expect(types).toContain('getHistory(): EList<Money>;');
    expect(types).toContain('convert(target: Money): Money;');
    expect(impl).toContain('convert(target: Money): Money {');
    for (const content of [types, impl]) {
      expect(content).not.toMatch(/\bEMoney\b|\bEJsonValue\b|\bEInstant\b|\bEString\b/);
    }
  });

  it('emits generic datatypes with their type arguments', () => {
    const files = generate(buildPaymentMetamodel(), typescriptTemplateSet, {});
    const types = files.find((f) => f.path === 'types/Payment.ts')!.content;
    const impl = files.find((f) => f.path === 'impl/PaymentImpl.ts')!.content;
    expect(types).toContain('getRaw(): TypeScriptClass<unknown> | undefined;');
    expect(types).toContain('getRefundType(): TypeScriptClass<Refund> | undefined;');
    expect(types).toContain('setRefundType(value: TypeScriptClass<Refund> | undefined): void;');
    expect(types).toContain('getAnyType(): TypeScriptClass<unknown> | undefined;');
    expect(types).toContain('getNameType(): TypeScriptClass<string> | undefined;');
    expect(types).toContain('kindOf(): TypeScriptClass<Refund>;');
    expect(impl).toContain('private _refundType: TypeScriptClass<Refund> | undefined;');
    // Never a bare (argument-less) use of the generic type - ignoring the import statements themselves.
    const code = (content: string) => content.replace(/^import .*$/gm, '');
    expect(code(types)).not.toMatch(/TypeScriptClass(?!<)/);
    expect(code(impl)).not.toMatch(/TypeScriptClass(?!<)/);
  });

  it('imports the annotation-supplied types, relative to each importing file, plus the class bound inside a type argument', () => {
    const files = generate(buildPaymentMetamodel(), typescriptTemplateSet, {});
    const types = files.find((f) => f.path === 'types/Payment.ts')!.content;
    const impl = files.find((f) => f.path === 'impl/PaymentImpl.ts')!.content;
    expect(types).toContain("import { Money } from './Money.js';");
    expect(types).toContain("import { TypeScriptClass } from './TypeScriptClass.js';");
    expect(types).toContain("import { Refund } from './Refund.js';");
    expect(impl).toContain("import { Money } from '../types/Money.js';");
    expect(impl).toContain("import { TypeScriptClass } from '../types/TypeScriptClass.js';");
    expect(impl).toContain("import { Refund } from '../types/Refund.js';");
    for (const f of files) {
      expect(f.content.match(/import \{[^}]*\bMoney\b[^}]*\}/g)?.length ?? 0, f.path).toBeLessThanOrEqual(1);
    }
  });

  it('keeps annotation imports unchanged in generate-ecore mode', () => {
    const files = generate(buildPaymentMetamodel(), typescriptTemplateSet, { 'generate-ecore': true });
    const impl = files.find((f) => f.path === 'impl/PaymentImpl.ts')!.content;
    expect(impl).toContain("import { Money } from '../types/Money.js';");
    expect(impl).toContain("import { TypeScriptClass } from '../types/TypeScriptClass.js';");
  });

  it('type-checks once the imported modules exist', async () => {
    const files = generate(buildPaymentMetamodel(), typescriptTemplateSet, {});
    for (const file of files) {
      const tsPath = join(dir, file.path);
      await mkdir(dirname(tsPath), { recursive: true });
      await writeFile(tsPath, file.content, 'utf-8');
    }
    // The files the annotations' internal-from point at - user-supplied, not generated.
    await writeFile(
      join(dir, 'types', 'Money.ts'),
      'export type Money = { amount: number; currency: string };\n',
      'utf-8'
    );
    await writeFile(
      join(dir, 'types', 'TypeScriptClass.ts'),
      'export type TypeScriptClass<T> = new (...args: never[]) => T;\n',
      'utf-8'
    );

    const program = ts.createProgram(
      [
        ...files.map((f) => join(dir, f.path)),
        join(dir, 'types', 'Money.ts'),
        join(dir, 'types', 'TypeScriptClass.ts'),
      ],
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
});
