import { describe, expect, it } from 'vitest';
import { EAttributeImpl, EClassImpl, EcorePackageImpl, UnmodifiableEList } from '../../index.js';

describe('UnmodifiableEList', () => {
  it('reads like any list and rejects every change', () => {
    const list = new UnmodifiableEList(['a', 'b']);
    expect(list.toArray()).toEqual(['a', 'b']);
    expect(list.get(1)).toBe('b');

    expect(() => list.add('c')).toThrow(/cannot be modified/);
    expect(() => list.addAt(0, 'c')).toThrow(/cannot be modified/);
    expect(() => list.addAll(['c'])).toThrow(/cannot be modified/);
    expect(() => list.remove('a')).toThrow(/cannot be modified/);
    expect(() => list.removeAt(0)).toThrow(/cannot be modified/);
    expect(() => list.clear()).toThrow(/cannot be modified/);
    expect(() => list.move(0, 1)).toThrow(/cannot be modified/);
    expect(list.toArray()).toEqual(['a', 'b']);
  });
});

describe('computed many-valued features', () => {
  it('cannot be changed through the returned list', () => {
    const eClass = new EClassImpl();
    const name = new EAttributeImpl();
    name.setName('name');
    name.setEType(EcorePackageImpl.eINSTANCE.getEString());
    eClass.getEStructuralFeatures().add(name);

    expect(() => eClass.getEAllAttributes().add(new EAttributeImpl())).toThrow(/cannot be modified/);
    expect(eClass.getEAllAttributes().toArray()).toEqual([name]);
  });

  it('still reflect changes to the features they are computed from', () => {
    const eClass = new EClassImpl();
    expect(eClass.getEAllStructuralFeatures().size()).toBe(0);
    eClass.getEStructuralFeatures().add(new EAttributeImpl());
    expect(eClass.getEAllStructuralFeatures().size()).toBe(1);
  });
});

describe('EObject.eContents()', () => {
  it('is a read-only snapshot of the direct children', () => {
    const container = new EClassImpl();
    const attribute = new EAttributeImpl();
    container.getEStructuralFeatures().add(attribute);

    const contents = container.eContents();
    expect(contents.toArray()).toEqual([attribute]);
    expect(() => contents.add(new EAttributeImpl())).toThrow(/cannot be modified/);
  });
});
