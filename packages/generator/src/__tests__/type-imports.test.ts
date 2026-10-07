import {
  DynamicEFactoryImpl,
  EAnnotationImpl,
  EAttributeImpl,
  EClassImpl,
  EDataTypeImpl,
  EPackageImpl,
  setDetailValue,
  type EClassifier,
} from '@typemf/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { resetGenerationContext } from '../generation-context.js';
import { importCollector } from '../import-collector.js';
import { resolveDataTypeTs, tsScalarType } from '../typescript-filters.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';
import { annotatedDataType } from './sample-metamodel.js';

const GENERATOR = 'https://typemf.dev/generator';
const IMPORT = 'https://typemf.dev/generator/import';

function annotate(target: EClassifier, source: string, details: Record<string, string>): void {
  const a = new EAnnotationImpl();
  a.setSource(source);
  for (const [k, v] of Object.entries(details)) setDetailValue(a.getDetails(), k, v);
  target.getEAnnotations().add(a);
}

/**
 * A datatype named EMoney. `details` is its IMPORT annotation (source .../generator/import); `text` is the
 * `type` detail of its plain generator annotation - by default the import's own `type`, since the two
 * usually name the same thing.
 */
function money(details: Record<string, string> | undefined, text: string | undefined = details?.type): EDataTypeImpl {
  const dt = new EDataTypeImpl();
  dt.setName('EMoney');
  if (text !== undefined) annotate(dt, GENERATOR, { type: text });
  if (details) annotate(dt, IMPORT, details);
  return dt;
}

/** A package, with the given classifiers belonging to it. */
function pkg(name: string, ...classifiers: EClassifier[]): EPackageImpl {
  const p = new EPackageImpl();
  p.setName(name);
  p.setNsURI(`https://test/${name}`);
  p.setNsPrefix(name);
  for (const c of classifiers) {
    p.getEClassifiers().add(c);
    (c as EClassImpl).setEPackage(p);
  }
  p.setEFactoryInstance(new DynamicEFactoryImpl());
  return p;
}

/** A class with one attribute per given [name, type, upperBound] entry. */
function classWith(name: string, ...features: Array<[string, EClassifier, number?]>): EClassImpl {
  const c = new EClassImpl();
  c.setName(name);
  for (const [featureName, type, upper] of features) {
    const a = new EAttributeImpl();
    a.setName(featureName);
    a.setEType(type);
    a.setUpperBound(upper ?? 1);
    a.setEContainingClass(c);
    c.getEStructuralFeatures().add(a);
  }
  return c;
}

const BOTH = { type: 'Money', from: '@acme/money', 'internal-from': './types/Money' };

/** The referenced package A (declares EMoney) and the package being generated, B (uses it). */
function referencing(details: Record<string, string> | undefined, text?: string) {
  const eMoney = money(details, text ?? details?.type);
  const a = pkg('a', eMoney);
  const b = pkg('b', classWith('Child', ['price', eMoney]));
  return { a, b, eMoney };
}

const file = (files: Array<{ path: string; content: string }>, path: string) =>
  files.find((f) => f.path === path)!.content;

describe('import annotation', () => {
  beforeEach(() => {
    resetGenerationContext();
    importCollector.clear();
  });

  it('the type text is the `type` detail of the generator annotation', () => {
    expect(resolveDataTypeTs(money({ type: 'Money' })).text).toBe('Money');
  });

  it('the import annotation alone supplies the import but not the text', () => {
    const dt = new EDataTypeImpl(); // an import annotation and NOTHING else
    dt.setName('EMoney');
    annotate(dt, IMPORT, { type: 'Money', 'internal-from': './types/Money' });
    expect(resolveDataTypeTs(dt)).toEqual({ text: 'EMoney', importName: 'Money', importFrom: './types/Money' });
  });

  it('text and imported symbol are independent', () => {
    const dt = money({ type: 'Money', 'internal-from': './types/Money' }, 'Money | undefined');
    expect(resolveDataTypeTs(dt)).toEqual({
      text: 'Money | undefined',
      importName: 'Money',
      importFrom: './types/Money',
    });
    expect(tsScalarType(dt)).toBe('Money | undefined');
    expect(importCollector.render('impl', {})).toBe("import { Money } from '../types/Money';");
  });

  it('an annotation without a `type` is ignored', () => {
    expect(resolveDataTypeTs(money({ from: '@acme/money', 'internal-from': './types/Money' }))).toEqual({
      text: 'EMoney',
    });
  });
});

/** Where the generated code of package a, which declares the data types package b uses, is. */
const PACKAGE_A = { 'package-imports': { 'https://test/a': '../a' } };

describe('internal and external types', () => {
  beforeEach(() => {
    resetGenerationContext();
    importCollector.clear();
  });

  it('imports an external type from `from`', () => {
    const { b } = referencing(BOTH);
    const files = generate(b, typescriptTemplateSet, PACKAGE_A);
    for (const path of ['types/Child.ts', 'impl/ChildImpl.ts']) {
      expect(file(files, path), path).toContain("import { Money } from '@acme/money';");
      expect(file(files, path), path).not.toContain('./types/Money');
    }
    expect(file(files, 'types/Child.ts')).toContain('getPrice(): Money | undefined;');
  });

  it('imports an internal type from `internal-from`, relative to each folder', () => {
    const eMoney = money(BOTH);
    const a = pkg('a', eMoney, classWith('Holder', ['price', eMoney]));
    const files = generate(a, typescriptTemplateSet, {});
    expect(file(files, 'types/Holder.ts')).toContain("import { Money } from './Money';");
    expect(file(files, 'impl/HolderImpl.ts')).toContain("import { Money } from '../types/Money';");
    expect(file(files, 'types/Holder.ts')).not.toContain('@acme/money');
  });

  it('decides per generate() call whether a type is internal', () => {
    const eMoney = money(BOTH);
    const a = pkg('a', eMoney, classWith('Holder', ['price', eMoney]));
    const b = pkg('b', classWith('Child', ['price', eMoney]));
    expect(file(generate(a, typescriptTemplateSet, {}), 'types/Holder.ts')).toContain("from './Money'");
    expect(file(generate(b, typescriptTemplateSet, PACKAGE_A), 'types/Child.ts')).toContain("from '@acme/money'");
    expect(file(generate(a, typescriptTemplateSet, {}), 'types/Holder.ts')).toContain("from './Money'");
  });

  it('an internal type with only `from` is imported from `from`', () => {
    const eBig = money({ type: 'Big', from: 'big.js' });
    const files = generate(pkg('a', eBig, classWith('Holder', ['price', eBig])), typescriptTemplateSet, {});
    expect(file(files, 'types/Holder.ts')).toContain("import { Big } from 'big.js';");
  });

  it('an external type with only `internal-from` gets no import', () => {
    const { b } = referencing({ type: 'Money', 'internal-from': './types/Money' });
    const child = file(generate(b, typescriptTemplateSet, PACKAGE_A), 'types/Child.ts');
    expect(child).toContain('getPrice(): Money | undefined;');
    expect(child).not.toMatch(/import \{[^}]*\bMoney\b/);
  });

  it('outside generate() no type is external', () => {
    const { eMoney } = referencing(BOTH); // belongs to package a, but no generation is running
    expect(resolveDataTypeTs(eMoney)).toEqual({ text: 'Money', importName: 'Money', importFrom: './types/Money' });
  });

  it("merges an external import from @typemf/core with the templates' EList import", () => {
    const eelist = new EDataTypeImpl();
    eelist.setName('EEList');
    annotate(eelist, GENERATOR, { type: 'EList' });
    annotate(eelist, IMPORT, { type: 'EList', from: '@typemf/core', 'internal-from': './types/EList' });
    const eString = annotatedDataType('EString', 'string');
    const a = pkg('a', eelist); // where EEList is declared - external to b
    const b = pkg('b', eString, classWith('Child', ['tags', eString, -1], ['raw', eelist]));
    expect(a.getEClassifiers().size()).toBe(1);
    const child = file(generate(b, typescriptTemplateSet, PACKAGE_A), 'types/Child.ts');
    const coreImports = child.match(/^import \{[^}]*\} from '@typemf\/core';$/gm) ?? [];
    expect(coreImports).toHaveLength(1); // one statement...
    expect(coreImports[0]!.match(/\bEList\b/g)).toHaveLength(1); // ...naming EList once
    expect(child).toContain('getRaw(): EList | undefined;');
    expect(child).toContain('getTags(): EList<string>;');
  });
});

describe('import mappings supplied with the model', () => {
  beforeEach(() => {
    resetGenerationContext();
    importCollector.clear();
  });

  const KEY = 'https://test/a#EMoney';

  it('an entry supplies the import for a type without an import annotation', () => {
    const { b } = referencing(undefined, 'Money'); // the TEXT still comes from the model; the mapping supplies the import
    const files = generate(b, typescriptTemplateSet, {
      ...PACKAGE_A,
      'type-imports': { [KEY]: { type: 'Money', from: '@acme/money' } },
    });
    expect(file(files, 'types/Child.ts')).toContain("import { Money } from '@acme/money';");
    expect(file(files, 'types/Child.ts')).toContain('getPrice(): Money | undefined;');
  });

  it('an entry replaces the annotation', () => {
    const { b } = referencing({ type: 'Money', from: '@old/money', 'internal-from': './types/OldMoney' });
    const child = file(
      generate(b, typescriptTemplateSet, {
        ...PACKAGE_A,
        'type-imports': { [KEY]: { type: 'Money', from: '@new/money' } },
      }),
      'types/Child.ts'
    );
    expect(child).toContain("import { Money } from '@new/money';");
    expect(child).not.toContain('OldMoney');
    expect(child).not.toContain('@old/money');
  });

  it("entries use the annotation's key names", () => {
    const eMoney = money(undefined);
    const files = generate(pkg('a', eMoney, classWith('Holder', ['price', eMoney])), typescriptTemplateSet, {
      'type-imports': { [KEY]: { type: 'Money', from: '@acme/money', 'internal-from': './types/Money' } },
    });
    expect(file(files, 'types/Holder.ts')).toContain("import { Money } from './Money';");
  });

  it('an entry without a `type` is ignored', () => {
    const { b } = referencing(BOTH);
    const child = file(
      generate(b, typescriptTemplateSet, { ...PACKAGE_A, 'type-imports': { [KEY]: { from: '@ignored/money' } } }),
      'types/Child.ts'
    );
    expect(child).toContain("import { Money } from '@acme/money';");
    expect(child).not.toContain('@ignored');
  });

  it('entries are keyed by `<nsURI>#<classifier name>`', () => {
    const { b } = referencing(undefined);
    const child = file(
      generate(b, typescriptTemplateSet, {
        ...PACKAGE_A,
        'type-imports': {
          'https://test/other#EMoney': { type: 'Money', from: '@acme/money' },
          'https://test/a#EOther': { type: 'Money', from: '@acme/money' },
        },
      }),
      'types/Child.ts'
    );
    expect(child).toContain('getPrice(): EMoney | undefined;'); // falls through to the name
    expect(child).not.toContain('@acme/money');
  });
});
