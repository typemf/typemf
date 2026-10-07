import { describe, expect, it } from 'vitest';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EcoreFactoryImpl } from '../impl/EcoreFactoryImpl.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';

/**
 * Unlike the other tests, this file does not start with `void EcorePackageImpl.eINSTANCE;`: it
 * tests construction before anything touched the package. Vitest gives each test file its own
 * module registry, so the package is not constructed yet.
 */
describe('using core without first touching EcorePackageImpl.eINSTANCE', () => {
  it('new EClassImpl().setName(...) works directly', () => {
    const cls = new EClassImpl();
    cls.setName('Book');
    expect(cls.getName()).toBe('Book');
    expect(cls.eClass().getName()).toBe('EClass');
  });

  it('new EcoreFactoryImpl().createEClass() works directly', () => {
    const cls = new EcoreFactoryImpl().createEClass();
    cls.setName('Thing');
    expect(cls.getName()).toBe('Thing');
  });

  it('EcoreFactoryImpl.eINSTANCE constructs the singleton on demand and is stable', () => {
    const factory = EcoreFactoryImpl.eINSTANCE;
    expect(factory.createEClass().eClass().getName()).toBe('EClass');
    expect(EcoreFactoryImpl.eINSTANCE).toBe(factory);
    expect(EcorePackageImpl.eINSTANCE.getEFactoryInstance()).toBe(factory);
  });
});
