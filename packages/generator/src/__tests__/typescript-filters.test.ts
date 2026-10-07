import {
  EAnnotationImpl,
  EAttributeImpl,
  EcorePackageImpl,
  EOperationImpl,
  EParameterImpl,
  setDetailValue,
} from '@typemf/core';
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
  primitiveDefaultValue,
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

  it('wraps a line longer than 100 columns at spaces and keeps blank lines', () => {
    const { bookClass } = buildSampleMetamodel();
    const annotation = new EAnnotationImpl();
    annotation.setSource('http://www.eclipse.org/emf/2002/Ecore');
    const long = Array.from({ length: 20 }, (_, i) => `word${i}`).join(' ');
    setDetailValue(annotation.getDetails(), 'documentation', `${long}\n\nShort.`);
    bookClass.getEAnnotations().add(annotation);

    const lines = docComment(bookClass, '  ').split('\n');
    expect(lines.every((line) => line.length <= 100)).toBe(true);
    expect(
      lines
        .slice(1, -1)
        .map((line) => line.replace(/^ {3}\* ?/, ''))
        .join(' ')
    ).toBe(`${long}  Short.`);
    expect(lines).toContain('   *');
  });

  describe('sources: the generator annotation first, then Ecore', () => {
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

    it('uses the `documentation` of the generator annotation', () => {
      expect(docComment(documented([GENERATOR, { documentation: 'From typemf.' }]))).toBe('/** From typemf. */');
    });

    it('falls back to the Ecore `documentation`', () => {
      expect(docComment(documented([ECORE, { documentation: 'From Ecore.' }]))).toBe('/** From Ecore. */');
    });

    it('prefers the generator annotation regardless of order', () => {
      const gm = [ECORE, { documentation: 'Ecore loses.' }] as [string, Record<string, string>];
      const tm = [GENERATOR, { documentation: 'typemf wins.' }] as [string, Record<string, string>];
      expect(docComment(documented(gm, tm))).toBe('/** typemf wins. */');
      expect(docComment(documented(tm, gm))).toBe('/** typemf wins. */');
    });

    it('treats an empty generator documentation as absent', () => {
      expect(docComment(documented([GENERATOR, { documentation: '' }], [ECORE, { documentation: 'Fallback.' }]))).toBe(
        '/** Fallback. */'
      );
    });

    it('ignores other keys and sources', () => {
      expect(
        docComment(documented([GENERATOR, { doc: 'no' }], ['http://example.com/other', { documentation: 'no' }]))
      ).toBe('');
    });

    it('does not read the GenModel documentation', () => {
      expect(docComment(documented([GENMODEL, { documentation: 'Ignored.' }]))).toBe('');
      expect(documentationOf(documented([GENMODEL, { documentation: 'Ignored.' }]))).toBeUndefined();
      expect(
        docComment(documented([GENMODEL, { documentation: 'Ignored.' }], [ECORE, { documentation: 'Used.' }]))
      ).toBe('/** Used. */');
    });

    it('documentationOf() returns the raw value', () => {
      expect(documentationOf(documented([ECORE, { documentation: 'X' }], [GENERATOR, { documentation: 'Y' }]))).toBe(
        'Y'
      );
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

  it('returns the formula of each built-in derived feature', () => {
    expect(trivialDerivedFormula(feature('many', true))).toBe(
      'this.getUpperBound() === -1 || this.getUpperBound() > 1'
    );
    expect(trivialDerivedFormula(feature('required', true))).toBe('this.getLowerBound() >= 1');
    expect(trivialDerivedFormula(feature('container', true))).toBe('(this.getEOpposite()?.isContainment() ?? false)');
    expect(trivialDerivedFormula(feature('eReferenceType', true))).toBe('(this.getEType() as EClass | undefined)');
    expect(trivialDerivedFormula(feature('eAttributeType', true))).toBe('(this.getEType() as EDataType | undefined)');
  });

  it('applies only to derived features', () => {
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

  it('uses the `body` of the generator annotation', () => {
    expect(operationBody(opWith([GENERATOR, { body: 'return this.getTitle();' }]))).toBe('return this.getTitle();');
  });

  it('falls back to the `body` of the GenModel annotation', () => {
    expect(operationBody(opWith([GENMODEL, { body: 'return "gm";' }]))).toBe('return "gm";');
  });

  it('prefers the generator annotation regardless of order', () => {
    const gm = [GENMODEL, { body: 'return "gm";' }] as [string, Record<string, string>];
    const tm = [GENERATOR, { body: 'return "tm";' }] as [string, Record<string, string>];
    expect(operationBody(opWith(gm, tm))).toBe('return "tm";');
    expect(operationBody(opWith(tm, gm))).toBe('return "tm";');
  });

  it('treats an empty generator body as absent', () => {
    expect(operationBody(opWith([GENERATOR, { body: '' }], [GENMODEL, { body: 'return "gm";' }]))).toBe('return "gm";');
  });

  it('a `body` in any other annotation source, or a different key in a known one, is ignored', () => {
    expect(
      operationBody(opWith(['http://example.com/other', { body: 'return 1;' }], [GENMODEL, { documentation: 'docs' }]))
    ).toBeUndefined();
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
  it('produces escaped string literals', () => {
    expect(jsString("don't")).toBe('"don\'t"');
    expect(jsString('line one\nline two')).toBe('"line one\\nline two"');
    expect(jsString('has "double quotes" too')).toBe('"has \\"double quotes\\" too"');
    expect(jsString('back\\slash')).toBe('"back\\\\slash"');

    // Every result must be valid as a standalone JS expression.

    expect(eval(jsString('it\'s a "test" with\nnewlines and \\backslashes\\'))).toBe(
      'it\'s a "test" with\nnewlines and \\backslashes\\'
    );
  });
});

describe('primitiveDefaultValue', () => {
  const ecore = EcorePackageImpl.eINSTANCE;
  function attribute(type: ReturnType<typeof ecore.getEInt>, literal?: string): EAttributeImpl {
    const attr = new EAttributeImpl();
    attr.setName('a');
    attr.setEType(type);
    if (literal !== undefined) attr.setDefaultValueLiteral(literal);
    return attr;
  }

  it('emits the zero value of the type without a defaultValueLiteral', () => {
    expect(primitiveDefaultValue(attribute(ecore.getEBoolean()))).toBe('false');
    expect(primitiveDefaultValue(attribute(ecore.getEInt()))).toBe('0');
    expect(primitiveDefaultValue(attribute(ecore.getELong()))).toBe('0n');
  });

  it('emits the defaultValueLiteral as a TypeScript literal of the type', () => {
    expect(primitiveDefaultValue(attribute(ecore.getEBoolean(), 'TRUE'))).toBe('true');
    expect(primitiveDefaultValue(attribute(ecore.getEDouble(), '2.50'))).toBe('2.5');
    expect(primitiveDefaultValue(attribute(ecore.getELong(), '9007199254740993'))).toBe('9007199254740993n');
  });

  it('throws for a defaultValueLiteral that is not a valid value', () => {
    expect(() => primitiveDefaultValue(attribute(ecore.getEInt(), 'many')).toString()).toThrow(
      /Invalid defaultValueLiteral/
    );
    expect(() => primitiveDefaultValue(attribute(ecore.getELong(), '1.5'))).toThrow(/Invalid defaultValueLiteral/);
  });
});
