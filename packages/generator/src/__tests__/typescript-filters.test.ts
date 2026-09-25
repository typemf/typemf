import { EAnnotationImpl, EOperationImpl, EParameterImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import {
  argList,
  docComment,
  isEClass,
  isEDataType,
  isEEnum,
  jsString,
  operationBody,
  paramList,
  tsFeatureType,
  tsScalarType,
} from '../typescript-filters.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('docComment / documentationOf', () => {
  it('renders a single-line GenModel documentation annotation as a one-line JSDoc', () => {
    const { bookClass } = buildSampleMetamodel();
    const annotation = new EAnnotationImpl();
    annotation.setSource('http://www.eclipse.org/emf/2002/GenModel');
    annotation.getDetails().set('documentation', 'A single book in the library.');
    bookClass.getEAnnotations().add(annotation);

    expect(docComment(bookClass)).toBe('/** A single book in the library. */\n');
  });

  it('renders a multi-line documentation value as a full JSDoc block', () => {
    const { bookClass } = buildSampleMetamodel();
    const annotation = new EAnnotationImpl();
    annotation.setSource('http://www.eclipse.org/emf/2002/GenModel');
    annotation.getDetails().set('documentation', 'Line one.\nLine two.');
    bookClass.getEAnnotations().add(annotation);

    expect(docComment(bookClass)).toBe('/**\n * Line one.\n * Line two.\n */\n');
  });

  it('returns an empty string when there is no GenModel documentation annotation', () => {
    const { bookClass } = buildSampleMetamodel();
    expect(docComment(bookClass)).toBe('');
  });
});

describe('operationBody', () => {
  it('reads a template-set-scoped body key, not a bare "body" key', () => {
    const op = new EOperationImpl();
    op.setName('summarize');
    const annotation = new EAnnotationImpl();
    annotation.setSource('https://typemf.dev/generator');
    annotation.getDetails().set('body:typescript', 'return this.getTitle();');
    annotation.getDetails().set('body:java', 'return this.getTitle_JAVA();');
    op.getEAnnotations().add(annotation);

    expect(operationBody(op, 'typescript')).toBe('return this.getTitle();');
    expect(operationBody(op, 'java')).toBe('return this.getTitle_JAVA();');
    expect(operationBody(op, 'python')).toBeUndefined();
  });

  it('returns undefined when there is no operation-body annotation at all', () => {
    const op = new EOperationImpl();
    op.setName('summarize');
    expect(operationBody(op, 'typescript')).toBeUndefined();
  });
});

describe('type mapping', () => {
  it('maps EDataType primitives to their TypeScript equivalents', () => {
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
