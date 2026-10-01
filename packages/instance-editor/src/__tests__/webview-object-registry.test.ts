import { EcorePackageImpl, EClassImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { WebviewObjectRegistry } from '../webview-object-registry.js';

void EcorePackageImpl.eINSTANCE;

describe('WebviewObjectRegistry', () => {
  it('hostIdFor returns undefined for an object that was never recorded', () => {
    const registry = new WebviewObjectRegistry();
    expect(registry.hostIdFor(new EClassImpl())).toBeUndefined();
  });

  it('hostIdFor returns the id record() gave it', () => {
    const registry = new WebviewObjectRegistry();
    const obj = new EClassImpl();
    registry.record(obj, 'host-42');
    expect(registry.hostIdFor(obj)).toBe('host-42');
  });

  it('hostIdFor resolves one of Ecore\'s own classifiers via the well-known scheme, with no recording needed at all', () => {
    const registry = new WebviewObjectRegistry();
    const realEClass = EcorePackageImpl.eINSTANCE.getEClass();
    expect(registry.hostIdFor(realEClass)).toBe(`ecore:${realEClass.getClassifierID()}`);
  });

  it('a recorded id for one object does not leak to a different, unrecorded object', () => {
    const registry = new WebviewObjectRegistry();
    const recorded = new EClassImpl();
    const notRecorded = new EClassImpl();
    registry.record(recorded, 'host-1');
    expect(registry.hostIdFor(notRecorded)).toBeUndefined();
  });
});
