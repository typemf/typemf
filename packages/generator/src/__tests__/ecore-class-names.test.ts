import { EAttributeImpl, EClassImpl, EOperationImpl, EPackageImpl, EcorePackageImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { generate } from '../generate.js';
import { typescriptTemplateSet } from '../typescript-template-set.js';

/** A user package whose classes happen to have the names of Ecore's own metaclasses. */
function buildPackage() {
  const ecore = EcorePackageImpl.eINSTANCE;
  const pkg = new EPackageImpl();
  pkg.setName('names');
  pkg.setNsURI('https://typemf.dev/test/names');
  pkg.setNsPrefix('names');
  for (const name of ['EClassifier', 'EStructuralFeature', 'EOperation']) {
    const eClass = new EClassImpl();
    eClass.setName(name);
    const label = new EAttributeImpl();
    label.setName('label');
    label.setEType(ecore.getEString());
    eClass.getEStructuralFeatures().add(label);
    pkg.getEClassifiers().add(eClass);
  }
  const getClassifierID = new EOperationImpl();
  getClassifierID.setName('getClassifierID');
  getClassifierID.setEType(ecore.getEInt());
  (pkg.getEClassifier('EClassifier') as EClassImpl).getEOperations().add(getClassifierID);
  return pkg;
}

function file(files: { path: string; content: string }[], path: string): string {
  return files.find((f) => f.path === path)!.content;
}

describe("classes named like Ecore's metaclasses in a user package", () => {
  it('get no Ecore bookkeeping, and their own operations are generated', () => {
    const files = generate(buildPackage(), typescriptTemplateSet, {});

    const classifier = file(files, 'impl/EClassifierImpl.ts');
    expect(classifier).not.toContain('private classifierId');
    expect(classifier).not.toContain('setClassifierID');
    expect(classifier).toContain('getClassifierID(): number');
    expect(file(files, 'types/EClassifier.ts')).toContain('getClassifierID(): number');

    const feature = file(files, 'impl/EStructuralFeatureImpl.ts');
    expect(feature).not.toContain('private featureId');
    expect(feature).not.toContain('setFeatureID');
    expect(feature).not.toContain('private containerClass');
    expect(file(files, 'impl/EOperationImpl.ts')).not.toContain('private operationId');
  });
});
