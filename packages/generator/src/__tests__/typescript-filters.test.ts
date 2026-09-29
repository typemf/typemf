import { EAnnotationImpl, EAttributeImpl, EOperationImpl, EParameterImpl, setDetailValue } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import {
  argList,
  docComment,
  documentationOf,
  isEClass,
  isEDataType,
  isEEnum,
  jsString,
  operationBody,
  trivialDerivedFormula,
  paramList,
  tsFeatureType,
  tsScalarType,
} from '../typescript-filters.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('docComment / documentationOf', () => {
  it('renders a single-line Ecore documentation annotation as a one-line JSDoc', () => {
    const { bookClass } = buildSampleMetamodel();
    const annotation = new EAnnotationImpl();
    annotation.setSource('http://www.eclipse.org/emf/2002/Ecore');
    setDetailValue(annotation.getDetails(), 'documentation', 'A single book in the library.');
    bookClass.getEAnnotations().add(annotation);

    expect(docComment(bookClass)).toBe('/** A single book in the library. */');
  });

  it('renders a multi-line documentation value as a full JSDoc block', () => {
    const { bookClass } = buildSampleMetamodel();
    const annotation = new EAnnotationImpl();
    annotation.setSource('http://www.eclipse.org/emf/2002/Ecore');
    setDetailValue(annotation.getDetails(), 'documentation', 'Line one.\nLine two.');
    bookClass.getEAnnotations().add(annotation);

    expect(docComment(bookClass)).toBe('/**\n * Line one.\n * Line two.\n */');
  });

  describe('layering: typemf generator annotation first, the Ecore source as the fallback', () => {
    const GENERATOR = 'https://typemf.dev/generator';
    const ECORE = 'http://www.eclipse.org/emf/2002/Ecore';
    const GENMODEL = 'http://www.eclipse.org/emf/2002/GenModel';

    function documented(...annotations: Array<[source: string, details: Record<string, string>]>) {
      const { bookClass } = buildSampleMetamodel();
      for (const [source, details] of annotations) {
        const annotation = new EAnnotationImpl();
        annotation.setSource(source);
        for (const [k, v] of Object.entries(details)) setDetailValue(annotation.getDetails(), k, v);
        bookClass.getEAnnotations().add(annotation);
      }
      return bookClass;
    }

    it('layer 1: the `documentation` of the typemf generator annotation', () => {
      expect(docComment(documented([GENERATOR, { documentation: 'From typemf.' }]))).toBe('/** From typemf. */');
    });

    it('layer 2: the Ecore `documentation`, when the generator annotation has none', () => {
      expect(docComment(documented([ECORE, { documentation: 'From Ecore.' }]))).toBe('/** From Ecore. */');
    });

    it('layer 1 beats layer 2, whichever annotation was added first - and the loser is not used at all', () => {
      const gm = [ECORE, { documentation: 'Ecore loses.' }] as [string, Record<string, string>];
      const tm = [GENERATOR, { documentation: 'typemf wins.' }] as [string, Record<string, string>];
      expect(docComment(documented(gm, tm))).toBe('/** typemf wins. */');
      expect(docComment(documented(tm, gm))).toBe('/** typemf wins. */');
    });

    it('an empty layer-1 documentation counts as absent, so the fallback applies', () => {
      expect(docComment(documented([GENERATOR, { documentation: '' }], [ECORE, { documentation: 'Fallback.' }]))).toBe('/** Fallback. */');
    });

    it('the key is exactly `documentation`; other keys and other sources are ignored', () => {
      expect(docComment(documented([GENERATOR, { doc: 'no' }], ['http://example.com/other', { documentation: 'no' }]))).toBe('');
    });

    it('GenModel `documentation` (where real EMF keeps it) is NOT read - only the typemf and Ecore sources are', () => {
      expect(docComment(documented([GENMODEL, { documentation: 'Ignored.' }]))).toBe('');
      expect(documentationOf(documented([GENMODEL, { documentation: 'Ignored.' }]))).toBeUndefined();
      // ...and it does not interfere with the real layers either.
      expect(docComment(documented([GENMODEL, { documentation: 'Ignored.' }], [ECORE, { documentation: 'Used.' }]))).toBe('/** Used. */');
    });

    it('documentationOf() returns the raw layered value', () => {
      expect(documentationOf(documented([ECORE, { documentation: 'X' }], [GENERATOR, { documentation: 'Y' }]))).toBe('Y');
      expect(documentationOf(documented())).toBeUndefined();
    });
  });

  it('returns an empty string when there is no documentation annotation', () => {
    const { bookClass } = buildSampleMetamodel();
    expect(docComment(bookClass)).toBe('');
  });
});

describe('trivialDerivedFormula', () => {
  function feature(name: string, derived: boolean): EAttributeImpl {
    const f = new EAttributeImpl();
    f.setName(name);
    if (derived) f.setDerived(true);
    return f;
  }

  it('returns the formula for each of the five trivially-computable derived features', () => {
    expect(trivialDerivedFormula(feature('many', true))).toBe('this.getUpperBound() === -1 || this.getUpperBound() > 1');
    expect(trivialDerivedFormula(feature('required', true))).toBe('this.getLowerBound() >= 1');
    expect(trivialDerivedFormula(feature('container', true))).toBe('(this.getEOpposite()?.isContainment() ?? false)');
    expect(trivialDerivedFormula(feature('eReferenceType', true))).toBe('(this.getEType() as EClass | undefined)');
    expect(trivialDerivedFormula(feature('eAttributeType', true))).toBe('(this.getEType() as EDataType | undefined)');
  });

  it('only applies to a feature actually marked derived, even with a matching name', () => {
    expect(trivialDerivedFormula(feature('eAttributeType', false))).toBeUndefined();
  });

  it('returns undefined for any other name, derived or not', () => {
    expect(trivialDerivedFormula(feature('title', true))).toBeUndefined();
    expect(trivialDerivedFormula(feature('eAllAttributes', true))).toBeUndefined(); // handled by the `get` mechanism, not this table
  });
});

describe('operationBody', () => {
  const GENERATOR = 'https://typemf.dev/generator';
  const GENMODEL = 'http://www.eclipse.org/emf/2002/GenModel';

  function opWith(...annotations: Array<[source: string, details: Record<string, string>]>): EOperationImpl {
    const op = new EOperationImpl();
    op.setName('summarize');
    for (const [source, details] of annotations) {
      const annotation = new EAnnotationImpl();
      annotation.setSource(source);
      for (const [k, v] of Object.entries(details)) setDetailValue(annotation.getDetails(), k, v);
      op.getEAnnotations().add(annotation);
    }
    return op;
  }

  it('layer 1: the `body` of the typemf generator annotation', () => {
    expect(operationBody(opWith([GENERATOR, { body: 'return this.getTitle();' }]))).toBe('return this.getTitle();');
  });

  it('layer 2: the `body` of the GenModel annotation, when the generator annotation has none', () => {
    expect(operationBody(opWith([GENMODEL, { body: 'return "gm";' }]))).toBe('return "gm";');
  });

  it('layer 1 beats layer 2, whichever annotation was added first', () => {
    const gm = [GENMODEL, { body: 'return "gm";' }] as [string, Record<string, string>];
    const tm = [GENERATOR, { body: 'return "tm";' }] as [string, Record<string, string>];
    expect(operationBody(opWith(gm, tm))).toBe('return "tm";');
    expect(operationBody(opWith(tm, gm))).toBe('return "tm";');
  });

  it('an empty layer-1 body counts as absent, so layer 2 applies', () => {
    expect(operationBody(opWith([GENERATOR, { body: '' }], [GENMODEL, { body: 'return "gm";' }]))).toBe('return "gm";');
  });

  it('the key is exactly `body` - the old per-template-set key `body:typescript` is no longer read', () => {
    expect(operationBody(opWith([GENERATOR, { 'body:typescript': 'return 1;' }]))).toBeUndefined();
  });

  it('a `body` in any other annotation source, or a different key in a known one, is ignored', () => {
    expect(operationBody(opWith(['http://example.com/other', { body: 'return 1;' }], [GENMODEL, { documentation: 'docs' }]))).toBeUndefined();
  });

  it('returns undefined when there is no annotation at all', () => {
    expect(operationBody(opWith())).toBeUndefined();
  });
});

describe('type mapping', () => {
  it('resolves an EDataType to the TypeScript type its own import annotation (`type`) declares', () => {
    const { titleAttr, publishedAttr } = buildSampleMetamodel();
    expect(tsScalarType(titleAttr.getEType())).toBe('string');
    expect(tsScalarType(publishedAttr.getEType())).toBe('Date');
  });

  it('maps an EClass reference to its own generated type name', () => {
    const { featuredBookRef } = buildSampleMetamodel();
    expect(tsScalarType(featuredBookRef.getEType())).toBe('Book');
  });

  it("wraps a many-valued feature's type in EList<T>", () => {
    const { booksRef } = buildSampleMetamodel();
    expect(tsFeatureType(booksRef)).toBe('EList<Book>');
  });

  it('does not wrap a single-valued feature', () => {
    const { featuredBookRef } = buildSampleMetamodel();
    expect(tsFeatureType(featuredBookRef)).toBe('Book');
  });
});

describe('classifier kind detection', () => {
  it('distinguishes EClass and EDataType classifiers', () => {
    const { bookClass, titleAttr } = buildSampleMetamodel();
    expect(isEClass(bookClass)).toBe(true);
    expect(isEEnum(bookClass)).toBe(false);
    expect(isEDataType(bookClass)).toBe(false);

    const eStringType = titleAttr.getEType()!;
    expect(isEDataType(eStringType)).toBe(true);
    expect(isEClass(eStringType)).toBe(false);
  });
});

describe('operation parameter formatting', () => {
  it('formats a parameter list and a matching argument list', () => {
    const { publishedAttr } = buildSampleMetamodel();
    const op = new EOperationImpl();
    op.setName('doThing');
    const p1 = new EParameterImpl();
    p1.setName('when');
    p1.setEType(publishedAttr.getEType()); // reuse a real EDataType instance (EDate)
    op.getEParameters().add(p1);

    expect(paramList(op)).toBe('when: Date');
    expect(argList(op)).toBe('when');
  });
});

describe('jsString', () => {
  it('produces valid, safely-escaped TypeScript string literals for content naive quoting would break', () => {
    // Exactly the case that motivated this: free-form annotation/documentation
    // text is genuinely likely to contain apostrophes, unlike ordinary
    // classifier/feature names.
    expect(jsString("don't")).toBe('"don\'t"');
    expect(jsString('line one\nline two')).toBe('"line one\\nline two"');
    expect(jsString('has "double quotes" too')).toBe('"has \\"double quotes\\" too"');
    expect(jsString('back\\slash')).toBe('"back\\\\slash"');

    // Every result must be valid as a standalone JS expression.
    // eslint-disable-next-line no-eval
    expect(eval(jsString("it's a \"test\" with\nnewlines and \\backslashes\\"))).toBe(
      "it's a \"test\" with\nnewlines and \\backslashes\\"
    );
  });
});
