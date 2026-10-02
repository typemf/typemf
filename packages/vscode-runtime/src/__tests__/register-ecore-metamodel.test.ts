import { EcorePackageImpl, EPackageRegistryImpl } from '@typemf/core';
import { describe, expect, it } from 'vitest';
import { registerEcoreMetamodel } from '../register-ecore-metamodel.js';

void EcorePackageImpl.eINSTANCE;

describe('registerEcoreMetamodel', () => {
  it('registers EcorePackageImpl.eINSTANCE', () => {
    const registry = new EPackageRegistryImpl();
    registerEcoreMetamodel(registry);
    expect(registry.getPackage(EcorePackageImpl.eINSTANCE.getNsURI()!)).toBe(EcorePackageImpl.eINSTANCE);
  });
});
