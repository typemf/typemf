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

  it('assigns featureID as one flat, inheritance-continuing space (a subclass\'s own feature never collides with an inherited one)', () => {
    const { libraryPackage, bookClass, audioBookClass, titleAttr, publishedAttr, narratorAttr } =
      buildSampleMetamodel();
    assignFreshIds(libraryPackage);

    expect(titleAttr.getFeatureID()).toBe(0);
    expect(publishedAttr.getFeatureID()).toBe(1);
    // AudioBook's own narrator continues the count after Book's two
    // inherited features, rather than restarting at 0 - this is what lets
    // a generated AudioBookGen.eGet/eSet use one flat switch (handling its
    // own featureID 2, delegating 0/1 to super.eGet/eSet) without any
    // collision between inherited and own features.
    expect(narratorAttr.getFeatureID()).toBe(2);
    expect(bookClass.getEStructuralFeatures().size()).toBe(2);
    expect(audioBookClass.getEStructuralFeatures().size()).toBe(1);
  });

  it('recomputes getEAllStructuralFeatures() so inherited + own ordering stays correct after reassignment', () => {
    const { libraryPackage, audioBookClass, titleAttr, publishedAttr, narratorAttr } = buildSampleMetamodel();
    assignFreshIds(libraryPackage);

    expect([...audioBookClass.getEAllStructuralFeatures()]).toEqual([titleAttr, publishedAttr, narratorAttr]);
  });

  it('is idempotent-safe to call twice (regenerating twice gives the same result)', () => {
    const { libraryPackage, bookClass } = buildSampleMetamodel();
    assignFreshIds(libraryPackage);
    const firstId = bookClass.getClassifierID();
    assignFreshIds(libraryPackage);
    expect(bookClass.getClassifierID()).toBe(firstId);
  });
});
