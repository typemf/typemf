import { describe, expect, it } from 'vitest';
import { createInstanceOf } from '../impl/metamodel-helpers.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('EClassifier.isInstance', () => {
  it('EClass.isInstance recognizes instances of itself and its subtypes, and rejects everything else', () => {
    const { bookClass, audioBookClass, libraryClass } = buildSampleMetamodel();
    const book = createInstanceOf(bookClass);
    const audioBook = createInstanceOf(audioBookClass);

    expect(bookClass.isInstance(book)).toBe(true);
    expect(bookClass.isInstance(audioBook)).toBe(true);
    expect(audioBookClass.isInstance(book)).toBe(false);
    expect(libraryClass.isInstance(book)).toBe(false);
    expect(bookClass.isInstance('not an object')).toBe(false);
    expect(bookClass.isInstance(undefined)).toBe(false);
  });

  it('EDataType.isInstance checks the value against the TypeScript type, not every EObject', () => {
    const ecore = EcorePackageImpl.eINSTANCE;
    expect(ecore.getEString().isInstance('text')).toBe(true);
    expect(ecore.getEString().isInstance(42)).toBe(false);
    expect(ecore.getEInt().isInstance(42)).toBe(true);
    expect(ecore.getEInt().isInstance('42')).toBe(false);
    expect(ecore.getEBoolean().isInstance(true)).toBe(true);
    expect(ecore.getEBoolean().isInstance('true')).toBe(false);
    expect(ecore.getEBigInteger().isInstance(42n)).toBe(true);
    expect(ecore.getEBigInteger().isInstance(42)).toBe(false);
    expect(ecore.getEDate().isInstance(new Date())).toBe(true);
    expect(ecore.getEDate().isInstance('2024-01-01')).toBe(false);
  });

  it('a custom EDataType with no special-cased name is permissive, matching EMF default behavior', () => {
    const { titleAttr } = buildSampleMetamodel();
    const customStringType = titleAttr.getEType()!;
    expect(customStringType.isInstance('anything')).toBe(true);
    expect(customStringType.isInstance(undefined)).toBe(false);
  });
});
