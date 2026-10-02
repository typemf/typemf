import { describe, expect, it, vi } from 'vitest';
import { EClass } from '../types/EClass.js';
import { DynamicEObjectImpl } from '../impl/DynamicEObjectImpl.js';
import { EDataTypeImpl } from '../impl/EDataTypeImpl.js';
import { EFactoryImpl } from '../impl/EFactoryImpl.js';
import { EObject } from '../types/EObject.js';
import { EPackageImpl } from '../impl/EPackageImpl.js';
import { EClassImpl } from '../impl/EClassImpl.js';
import { DynamicEFactoryImpl } from '../impl/DynamicEFactoryImpl.js';
import { EcorePackageImpl } from '../impl/EcorePackageImpl.js';
// Ecore must be initialized before metaclass instances can be created.
void EcorePackageImpl.eINSTANCE;

class TestFactory extends EFactoryImpl {
  create(_eClass: EClass): EObject {
    throw new Error('not needed for these tests');
  }
}

function dataType(name: string): EDataTypeImpl {
  const d = new EDataTypeImpl();
  d.setName(name);
  return d;
}

describe('EFactoryImpl data type conversion', () => {
  it('converts every built-in Ecore data type, including the *Object variants', () => {
    const factory = new TestFactory();
    expect(factory.createFromString(dataType('EString'), 'hello')).toBe('hello');

    expect(factory.createFromString(dataType('EInt'), '42')).toBe(42);
    expect(factory.createFromString(dataType('EIntegerObject'), '42')).toBe(42);
    expect(factory.createFromString(dataType('ELong'), '42')).toBe(42);
    expect(factory.createFromString(dataType('ELongObject'), '42')).toBe(42);
    expect(factory.createFromString(dataType('EDouble'), '3.14')).toBe(3.14);
    expect(factory.createFromString(dataType('EDoubleObject'), '3.14')).toBe(3.14);
    expect(factory.createFromString(dataType('EFloat'), '3.14')).toBe(3.14);
    expect(factory.createFromString(dataType('EFloatObject'), '3.14')).toBe(3.14);
    expect(factory.createFromString(dataType('EShort'), '7')).toBe(7);
    expect(factory.createFromString(dataType('EShortObject'), '7')).toBe(7);
    expect(factory.createFromString(dataType('EByte'), '3')).toBe(3);
    expect(factory.createFromString(dataType('EByteObject'), '3')).toBe(3);

    expect(factory.createFromString(dataType('EBoolean'), 'true')).toBe(true);
    expect(factory.createFromString(dataType('EBooleanObject'), 'false')).toBe(false);

    expect(factory.createFromString(dataType('EChar'), 'x')).toBe('x');
    expect(factory.createFromString(dataType('ECharacterObject'), 'y')).toBe('y');

    expect(factory.createFromString(dataType('EBigInteger'), '123456789012345678901234567890')).toBe(
      123456789012345678901234567890n
    );

    // JavaScript has no arbitrary-precision decimal type, so EBigDecimal stays a string.
    expect(factory.createFromString(dataType('EBigDecimal'), '3.14159265358979')).toBe('3.14159265358979');

    const date = factory.createFromString(dataType('EDate'), '2026-01-15T00:00:00.000Z') as Date;
    expect(date).toBeInstanceOf(Date);
    expect(date.toISOString()).toBe('2026-01-15T00:00:00.000Z');
  });

  it('converts EDate to an ISO 8601 string', () => {
    const factory = new TestFactory();
    const date = new Date('2026-06-01T12:30:00.000Z');
    expect(factory.convertToString(dataType('EDate'), date)).toBe('2026-06-01T12:30:00.000Z');
  });

  it('returns the literal unchanged for an unknown data type', () => {
    const factory = new TestFactory();
    expect(factory.createFromString(dataType('MyCustomType'), 'whatever')).toBe('whatever');
  });

  it('throws for a data type from a different package', () => {
    const factory = new TestFactory();
    const ownPackage = new EPackageImpl();
    ownPackage.setName('mine');
    factory.setEPackage(ownPackage);

    const otherPackage = new EPackageImpl();
    otherPackage.setName('theirs');
    const foreignType = dataType('EInt');
    foreignType.setEPackage(otherPackage);

    expect(() => factory.createFromString(foreignType, '1')).toThrow(/not a valid classifier/);
  });

  it('skips the package check when the factory has no package', () => {
    const factory = new TestFactory();
    expect(factory.createFromString(dataType('EInt'), '1')).toBe(1);
  });
});

describe('EFactoryImpl.create()', () => {
  it('warns and creates a DynamicEObjectImpl for an unknown classifier', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const factory = new EFactoryImpl();
    const eClass = new EClassImpl();
    eClass.setName('Thing');
    eClass.setClassifierID(7);

    const instance = factory.create(eClass);

    expect(instance).toBeInstanceOf(DynamicEObjectImpl);
    expect(instance.eClass()).toBe(eClass);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toMatch(/classifier id 7.*Thing.*DynamicEObjectImpl/);
    warn.mockRestore();
  });

  it('throws for an abstract class or an interface', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const factory = new EFactoryImpl();

    const abstractClass = new EClassImpl();
    abstractClass.setName('AbstractThing');
    abstractClass.setAbstract(true);
    expect(() => factory.create(abstractClass)).toThrow(/AbstractThing.*abstract or an interface/);

    const interfaceClass = new EClassImpl();
    interfaceClass.setName('InterfaceThing');
    interfaceClass.setInterface(true);
    expect(() => factory.create(interfaceClass)).toThrow(/InterfaceThing.*abstract or an interface/);

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('is the fallback for generated factories calling super.create()', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    class PartialFactory extends EFactoryImpl {
      override create(eClass: EClass): EObject {
        if (eClass.getName() === 'Known') return {} as EObject;
        return super.create(eClass);
      }
    }
    const factory = new PartialFactory();
    const known = new EClassImpl();
    known.setName('Known');
    expect(factory.create(known)).toEqual({});

    const unknown = new EClassImpl();
    unknown.setName('Unknown');
    unknown.setClassifierID(99);
    expect(factory.create(unknown)).toBeInstanceOf(DynamicEObjectImpl);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('is overridden by DynamicEFactoryImpl without a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const eClass = new EClassImpl();
    eClass.setName('Thing');
    const instance = new DynamicEFactoryImpl().create(eClass);
    expect(instance.eClass()).toBe(eClass);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
