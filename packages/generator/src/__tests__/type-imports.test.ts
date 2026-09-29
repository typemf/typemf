import { DynamicEFactoryImpl, EAnnotationImpl, EAttributeImpl, EClassImpl, EDataTypeImpl, EPackageImpl, setDetailValue, type EClassifier } from '@typemf/core';
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

const file = (files: Array<{ path: string; content: string }>, path: string) => files.find((f) => f.path === path)!.content;

describe('import annotation: new source and keys', () => {
  beforeEach(() => {
    resetGenerationContext();
    importCollector.clear();
  });

  it('the TEXT is the `type` detail of the plain generator annotation', () => {
    expect(resolveDataTypeTs(money({ type: 'Money' })).text).toBe('Money');
  });

  it('the old source and keys are no longer read: the type falls through to its name, with no import', () => {
    const dt = new EDataTypeImpl();
    dt.setName('EMoney');
    annotate(dt, 'https://typemf.dev/generator', { 'typescript-type': 'Money', 'typescript-import-from': './types/Money' });
    expect(resolveDataTypeTs(dt)).toEqual({ text: 'EMoney' });
    // ...and the new source with the OLD keys is just as inert.
    const dt2 = new EDataTypeImpl();
    dt2.setName('EMoney');
    annotate(dt2, IMPORT, { 'typescript-type': 'Money' });
    expect(resolveDataTypeTs(dt2)).toEqual({ text: 'EMoney' });
  });

  it('the import annotation alone does NOT supply the text - the text falls through to the name - but its import still applies', () => {
    const dt = new EDataTypeImpl(); // an import annotation and NOTHING else
    dt.setName('EMoney');
    annotate(dt, IMPORT, { type: 'Money', 'internal-from': './types/Money' });
    expect(resolveDataTypeTs(dt)).toEqual({ text: 'EMoney', importName: 'Money', importFrom: './types/Money' });
  });

  it('text and import are independent: a compound text with a separately named symbol to import', () => {
    const dt = money({ type: 'Money', 'internal-from': './types/Money' }, 'Money | undefined');
    expect(resolveDataTypeTs(dt)).toEqual({ text: 'Money | undefined', importName: 'Money', importFrom: './types/Money' });
    expect(tsScalarType(dt)).toBe('Money | undefined');
    expect(importCollector.render('impl', {})).toBe("import { Money } from '../types/Money';");
  });

  it('an annotation without a `type` says nothing (there is no name to emit or import)', () => {
    expect(resolveDataTypeTs(money({ from: '@acme/money', 'internal-from': './types/Money' }))).toEqual({ text: 'EMoney' });
  });
});

describe('internal vs external, decided during generation', () => {
  beforeEach(() => {
    resetGenerationContext();
    importCollector.clear();
  });

  it('an EXTERNAL type (declared in another package) is imported from `from`', () => {
    const { b } = referencing(BOTH);
    const files = generate(b, typescriptTemplateSet, {});
    for (const path of ['types/Child.ts', 'impl/ChildImpl.ts']) {
      expect(file(files, path), path).toContain("import { Money } from '@acme/money';");
      expect(file(files, path), path).not.toContain('./types/Money');
    }
    expect(file(files, 'types/Child.ts')).toContain('getPrice(): Money | undefined;');
  });

  it('an INTERNAL type (declared in the package being generated) is imported from `internal-from`, relative per importing folder', () => {
    const eMoney = money(BOTH);
    const a = pkg('a', eMoney, classWith('Holder', ['price', eMoney]));
    const files = generate(a, typescriptTemplateSet, {});
    expect(file(files, 'types/Holder.ts')).toContain("import { Money } from './Money';");
    expect(file(files, 'impl/HolderImpl.ts')).toContain("import { Money } from '../types/Money';");
    expect(file(files, 'types/Holder.ts')).not.toContain('@acme/money');
  });

  it('the same type flips between the two as the package being generated changes - no state leaks across generate() calls', () => {
    const eMoney = money(BOTH);
    const a = pkg('a', eMoney, classWith('Holder', ['price', eMoney]));
    const b = pkg('b', classWith('Child', ['price', eMoney]));
    expect(file(generate(a, typescriptTemplateSet, {}), 'types/Holder.ts')).toContain("from './Money'");
    expect(file(generate(b, typescriptTemplateSet, {}), 'types/Child.ts')).toContain("from '@acme/money'");
    expect(file(generate(a, typescriptTemplateSet, {}), 'types/Holder.ts')).toContain("from './Money'");
  });

  it('INTERNAL with only `from`: falls back to it (e.g. a datatype wrapping a third-party library)', () => {
    const eBig = money({ type: 'Big', from: 'big.js' });
    const files = generate(pkg('a', eBig, classWith('Holder', ['price', eBig])), typescriptTemplateSet, {});
    expect(file(files, 'types/Holder.ts')).toContain("import { Big } from 'big.js';");
  });

  it('EXTERNAL with only `internal-from`: no import (a path relative to a foreign package root means nothing) - the type text is still emitted', () => {
    const { b } = referencing({ type: 'Money', 'internal-from': './types/Money' });
    const child = file(generate(b, typescriptTemplateSet, {}), 'types/Child.ts');
    expect(child).toContain('getPrice(): Money | undefined;');
    expect(child).not.toMatch(/import \{[^}]*\bMoney\b/);
  });

  it('with no generation in progress, nothing is external (direct calls, unit tests)', () => {
    const { eMoney } = referencing(BOTH); // belongs to package a, but no generation is running
    expect(resolveDataTypeTs(eMoney)).toEqual({ text: 'Money', importName: 'Money', importFrom: './types/Money' });
  });

  it('an external `from` of "@typemf/core" and the templates\' own foundational EList are ONE import - the collision the redesign exists to remove', () => {
    const eelist = new EDataTypeImpl();
    eelist.setName('EEList');
    annotate(eelist, GENERATOR, { type: 'EList' });
    annotate(eelist, IMPORT, { type: 'EList', from: '@typemf/core', 'internal-from': './types/EList' });
    const eString = annotatedDataType('EString', 'string');
    const a = pkg('a', eelist); // where EEList is declared - external to b
    const b = pkg('b', eString, classWith('Child', ['tags', eString, -1], ['raw', eelist]));
    expect(a.getEClassifiers().size()).toBe(1);
    const child = file(generate(b, typescriptTemplateSet, {}), 'types/Child.ts');
    const coreImports = child.match(/^import \{[^}]*\} from '@typemf\/core';$/gm) ?? [];
    expect(coreImports).toHaveLength(1); // one statement...
    expect(coreImports[0]!.match(/\bEList\b/g)).toHaveLength(1); // ...naming EList once
    expect(child).toContain('getRaw(): EList | undefined;');
    expect(child).toContain('getTags(): EList<string>;');
  });
});

describe('the mapping seam: import information supplied alongside the model', () => {
  beforeEach(() => {
    resetGenerationContext();
    importCollector.clear();
  });

  const KEY = 'https://test/a#EMoney';

  it('a pre-populated entry supplies the IMPORT for a type that carries no import annotation at all', () => {
    const { b } = referencing(undefined, 'Money'); // the TEXT still comes from the model; the mapping supplies the import
    const files = generate(b, typescriptTemplateSet, { 'type-imports': { [KEY]: { type: 'Money', from: '@acme/money' } } });
    expect(file(files, 'types/Child.ts')).toContain("import { Money } from '@acme/money';");
    expect(file(files, 'types/Child.ts')).toContain('getPrice(): Money | undefined;');
  });

  it('an explicit entry takes precedence over the annotation, replacing it entirely', () => {
    const { b } = referencing({ type: 'Money', from: '@old/money', 'internal-from': './types/OldMoney' });
    const child = file(generate(b, typescriptTemplateSet, { 'type-imports': { [KEY]: { type: 'Money', from: '@new/money' } } }), 'types/Child.ts');
    expect(child).toContain("import { Money } from '@new/money';");
    expect(child).not.toContain('OldMoney');
    expect(child).not.toContain('@old/money');
  });

  it('entries use the annotation\'s own key names (`internal-from`), so they can be copied between the two', () => {
    const eMoney = money(undefined);
    const files = generate(pkg('a', eMoney, classWith('Holder', ['price', eMoney])), typescriptTemplateSet, {
      'type-imports': { [KEY]: { type: 'Money', from: '@acme/money', 'internal-from': './types/Money' } },
    });
    expect(file(files, 'types/Holder.ts')).toContain("import { Money } from './Money';");
  });

  it('an entry without a `type` says nothing, exactly like an annotation without one - the annotation still applies', () => {
    const { b } = referencing(BOTH);
    const child = file(generate(b, typescriptTemplateSet, { 'type-imports': { [KEY]: { from: '@ignored/money' } } }), 'types/Child.ts');
    expect(child).toContain("import { Money } from '@acme/money';");
    expect(child).not.toContain('@ignored');
  });

  it('the key is `<nsURI>#<classifier name>` - an entry for a different package or name does not apply', () => {
    const { b } = referencing(undefined);
    const child = file(
      generate(b, typescriptTemplateSet, {
        'type-imports': { 'https://test/other#EMoney': { type: 'Money', from: '@acme/money' }, 'https://test/a#EOther': { type: 'Money', from: '@acme/money' } },
      }),
      'types/Child.ts'
    );
    expect(child).toContain('getPrice(): EMoney | undefined;'); // falls through to the name
    expect(child).not.toContain('@acme/money');
  });
});
