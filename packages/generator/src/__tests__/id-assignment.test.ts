import { describe, expect, it } from 'vitest';
import { assignFreshIds } from '../id-assignment.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('assignFreshIds', () => {
  it('assigns classifierID in declaration order across the whole package', () => {
    const { libraryPackage, bookClass, audioBookClass, libraryClass } = buildSampleMetamodel();
    assignFreshIds(libraryPackage);

    const classifiers = libraryPackage.getEClassifiers().toArray();
    expect(classifiers.map((c) => c.getClassifierID())).toEqual(classifiers.map((_, i) => i));
    expect(bookClass.getClassifierID()).toBeLessThan(audioBookClass.getClassifierID());
    expect(audioBookClass.getClassifierID()).toBeLessThan(libraryClass.getClassifierID());
  });

  it("continues a subclass's featureIDs after the inherited ones", () => {
    const { libraryPackage, bookClass, audioBookClass, titleAttr, publishedAttr, narratorAttr } =
      buildSampleMetamodel();
    assignFreshIds(libraryPackage);

    expect(titleAttr.getFeatureID()).toBe(0);
    expect(publishedAttr.getFeatureID()).toBe(1);
    // AudioBook's narrator continues after Book's two features.
    expect(narratorAttr.getFeatureID()).toBe(2);
    expect(bookClass.getEStructuralFeatures().size()).toBe(2);
    expect(audioBookClass.getEStructuralFeatures().size()).toBe(1);
  });

  it('keeps getEAllStructuralFeatures() in inherited-then-own order', () => {
    const { libraryPackage, audioBookClass, titleAttr, publishedAttr, narratorAttr } = buildSampleMetamodel();
    assignFreshIds(libraryPackage);

    expect([...audioBookClass.getEAllStructuralFeatures()]).toEqual([titleAttr, publishedAttr, narratorAttr]);
  });

  it('gives the same result when called twice', () => {
    const { libraryPackage, bookClass } = buildSampleMetamodel();
    assignFreshIds(libraryPackage);
    const firstId = bookClass.getClassifierID();
    assignFreshIds(libraryPackage);
    expect(bookClass.getClassifierID()).toBe(firstId);
  });
});
