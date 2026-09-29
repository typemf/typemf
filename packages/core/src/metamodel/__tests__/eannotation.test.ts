import { describe, expect, it } from 'vitest';
import { detailValue, setDetailValue } from '../impl/metamodel-helpers.js';
import { EAnnotationImpl } from '../../index.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('EAnnotation', () => {
  it('can be attached to any EModelElement and looked up by source', () => {
    const { titleAttr } = buildSampleMetamodel();

    const uiHint = new EAnnotationImpl();
    uiHint.setSource('https://typemf.dev/ui');
    setDetailValue(uiHint.getDetails(), 'widget', 'text-field');
    setDetailValue(uiHint.getDetails(), 'order', '1');

    titleAttr.getEAnnotations().add(uiHint);
    uiHint.setEModelElement(titleAttr);

    const found = titleAttr.getEAnnotation('https://typemf.dev/ui');
    expect(found).toBe(uiHint);
    expect(found && detailValue(found.getDetails(), 'widget')).toBe('text-field');
    expect(found?.getEModelElement()).toBe(titleAttr);
  });

  it('returns undefined for an unknown source', () => {
    const { titleAttr } = buildSampleMetamodel();
    expect(titleAttr.getEAnnotation('https://nope.example')).toBeUndefined();
  });

  it('supports multiple annotations from different sources on one element', () => {
    const { bookClass } = buildSampleMetamodel();

    const docAnnotation = new EAnnotationImpl();
    docAnnotation.setSource('https://typemf.dev/doc');
    setDetailValue(docAnnotation.getDetails(), 'summary', 'A single book in the library.');

    const genAnnotation = new EAnnotationImpl();
    genAnnotation.setSource('https://typemf.dev/generator');
    setDetailValue(genAnnotation.getDetails(), 'rest.expose', 'true');

    bookClass.getEAnnotations().add(docAnnotation);
    bookClass.getEAnnotations().add(genAnnotation);

    expect(bookClass.getEAnnotations().size()).toBe(2);
    const found = bookClass.getEAnnotation('https://typemf.dev/generator');
    expect(found && detailValue(found.getDetails(), 'rest.expose')).toBe('true');
  });

  it('detailValue/setDetailValue: updating an existing key changes it in place, not adding a duplicate', () => {
    const a = new EAnnotationImpl();
    setDetailValue(a.getDetails(), 'k', 'first');
    setDetailValue(a.getDetails(), 'k', 'second');
    expect(a.getDetails().size()).toBe(1);
    expect(detailValue(a.getDetails(), 'k')).toBe('second');
  });

  it('detailValue returns undefined for a missing key, without throwing', () => {
    const a = new EAnnotationImpl();
    expect(detailValue(a.getDetails(), 'nope')).toBeUndefined();
  });
});
