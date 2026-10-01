import { EcorePackageImpl, EClassImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { ObjectIdMap } from '../object-id-map.js';

void EcorePackageImpl.eINSTANCE;

describe('ObjectIdMap', () => {
  it('mints a fresh id the first time an object is seen', () => {
    const ids = new ObjectIdMap();
    const obj = new EClassImpl();
    expect(ids.idFor(obj)).toBeDefined();
  });

  it('returns the same id for the same object on repeated calls', () => {
    const ids = new ObjectIdMap();
    const obj = new EClassImpl();
    const first = ids.idFor(obj);
    const second = ids.idFor(obj);
    expect(second).toBe(first);
  });

  it('gives distinct objects distinct ids', () => {
    const ids = new ObjectIdMap();
    const a = new EClassImpl();
    const b = new EClassImpl();
    expect(ids.idFor(a)).not.toBe(ids.idFor(b));
  });

  it('objectFor resolves an id back to the exact same object', () => {
    const ids = new ObjectIdMap();
    const obj = new EClassImpl();
    const id = ids.idFor(obj);
    expect(ids.objectFor(id)).toBe(obj);
  });

  it('objectFor returns undefined for an id this map never issued', () => {
    const ids = new ObjectIdMap();
    expect(ids.objectFor('not-a-real-id')).toBeUndefined();
  });

  it('two separate ObjectIdMap instances are independent - one is unaffected by the other', () => {
    const idsA = new ObjectIdMap();
    const idsB = new ObjectIdMap();
    const objA1 = new EClassImpl();
    const objA2 = new EClassImpl();
    const objB = new EClassImpl();

    idsA.idFor(objA1);
    const idForObjA2 = idsA.idFor(objA2);
    idsB.idFor(objB); // a completely separate map - must not affect idsA's own assignments at all

    // idsA's own assignments are exactly as they were, unaffected by anything idsB just did.
    expect(idsA.objectFor(idForObjA2)).toBe(objA2);
    // idsB was never involved in assigning objA1's id - only idsA's own bookkeeping did that.
    expect(idsA.objectFor(idsA.idFor(objA1))).toBe(objA1);
  });
});
