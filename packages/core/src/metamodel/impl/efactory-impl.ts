import { EClass } from '../api/eclass.js';
import { EDataType } from '../api/edata-type.js';
import { EFactory } from '../api/efactory.js';
import { EObject } from '../api/eobject.js';
import { EPackage } from '../api/epackage.js';

/**
 * Abstract base for EFactory implementations. Provides default
 * createFromString/convertToString for the built-in primitive EDataTypes
 * (matched by name) so that generated per-package factories - and
 * DynamicEFactoryImpl - only need to implement create().
 *
 * This did not exist in the original TMF, where every generated factory
 * re-derived primitive conversion independently.
 *
 * Real EMF's own EFactoryImpl.createFromString() is considerably more
 * elaborate - it falls back to Java reflection (looking up a
 * String-argument constructor or a static valueOf(String) method on the
 * datatype's instance class) for arbitrary, non-built-in instance
 * classes. That reflective fallback has no TypeScript equivalent (no
 * "arbitrary runtime class with a string constructor" concept the way
 * Java's Class/Constructor reflection provides), so it isn't ported here.
 * What IS ported is real EMF's actual primitive-type coverage: the *Object
 * wrapper variants (EBooleanObject, EIntegerObject, ...) convert exactly
 * like their primitive counterparts, since TS/JS doesn't distinguish
 * primitive-vs-boxed types the way Java does.
 */
export abstract class EFactoryImpl implements EFactory {
  private ePackage: EPackage | undefined;

  getEPackage(): EPackage | undefined {
    return this.ePackage;
  }

  setEPackage(pkg: EPackage | undefined): void {
    this.ePackage = pkg;
  }

  abstract create(eClass: EClass): EObject;

  createFromString(eDataType: EDataType, literalValue: string): unknown {
    this.checkOwnership(eDataType);
    switch (eDataType.getName()) {
      case 'EString':
        return literalValue;
      case 'EInt':
      case 'EIntegerObject':
      case 'ELong':
      case 'ELongObject':
      case 'EDouble':
      case 'EDoubleObject':
      case 'EFloat':
      case 'EFloatObject':
      case 'EShort':
      case 'EShortObject':
      case 'EByte':
      case 'EByteObject':
        return Number(literalValue);
      case 'EBigInteger':
        // The one native JS type with a genuine arbitrary-precision
        // integer equivalent - unlike EBigDecimal below, this has a
        // real, correct mapping rather than a punt.
        return BigInt(literalValue);
      case 'EBoolean':
      case 'EBooleanObject':
        return literalValue === 'true';
      case 'EChar':
      case 'ECharacterObject':
        // TS/JS has no distinct character type - a single-character
        // string already IS the natural representation, unlike Java's
        // char-as-codepoint-with-string-fallback dance.
        return literalValue.charAt(0);
      case 'EDate':
        return new Date(literalValue);
      default:
        // EBigDecimal (no native JS arbitrary-precision decimal type -
        // returning it unconverted is honest, not a false-precision
        // guess) and any unknown/custom EDataType: hand back the literal
        // untouched rather than guessing at a conversion.
        return literalValue;
    }
  }

  convertToString(eDataType: EDataType, instanceValue: unknown): string {
    this.checkOwnership(eDataType);
    if ((eDataType.getName() === 'EDate') && instanceValue instanceof Date) {
      return instanceValue.toISOString();
    }
    return String(instanceValue);
  }

  /**
   * Real EMF's own createFromString/convertToString throw immediately if
   * asked to convert a datatype that doesn't belong to this factory's own
   * package - a real, easy, defensive check worth having: it turns "some
   * other package's factory silently mishandles your datatype" into a
   * clear, immediate error naming the actual problem.
   */
  private checkOwnership(eDataType: EDataType): void {
    if (this.ePackage !== undefined && eDataType.getEPackage() !== this.ePackage) {
      throw new Error(`The datatype '${eDataType.getName()}' is not a valid classifier of this factory's package.`);
    }
  }
}
