import { describe, expect, it } from 'vitest';
import { EClass } from '../api/eclass.js';
import { EDataTypeImpl } from '../impl/edata-type-impl.js';
import { EFactoryImpl } from '../impl/efactory-impl.js';
import { EObject } from '../api/eobject.js';
import { EPackageImpl } from '../impl/epackage-impl.js';

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

describe('EFactoryImpl - generic primitive conversion', () => {
  it('converts every built-in primitive name, including the *Object wrapper variants', () => {
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

    // EBigDecimal: no native JS arbitrary-precision decimal type - honest
    // pass-through rather than a false-precision guess.
    expect(factory.createFromString(dataType('EBigDecimal'), '3.14159265358979')).toBe('3.14159265358979');

    const date = factory.createFromString(dataType('EDate'), '2026-01-15T00:00:00.000Z') as Date;
    expect(date).toBeInstanceOf(Date);
    expect(date.toISOString()).toBe('2026-01-15T00:00:00.000Z');
  });

  it('round-trips convertToString for EDate specifically (ISO 8601)', () => {
    const factory = new TestFactory();
    const date = new Date('2026-06-01T12:30:00.000Z');
    expect(factory.convertToString(dataType('EDate'), date)).toBe('2026-06-01T12:30:00.000Z');
  });

  it('hands back an unknown/custom EDataType literal untouched, rather than guessing', () => {
    const factory = new TestFactory();
    expect(factory.createFromString(dataType('MyCustomType'), 'whatever')).toBe('whatever');
  });

  it('throws a clear error when asked to convert a datatype from a different package', () => {
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

  it('does not throw the ownership check when the factory has no package set at all (permissive default)', () => {
    const factory = new TestFactory();
    expect(factory.createFromString(dataType('EInt'), '1')).toBe(1);
  });
});
