import { describe, expect, it } from 'vitest';
import { EClassImpl } from '../impl/EClassImpl.js';
import { EcoreFactoryImpl } from '../impl/EcoreFactoryImpl.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';

/**
 * CORE-01: unlike every other test in this package, this file deliberately does NOT start with
 * `void EcorePackageImpl.eINSTANCE;` - the whole point is to exercise construction before
 * anything has touched the singleton. Vitest gives each test file its own, fresh module
 * registry, so this genuinely starts cold.
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
