import { EClass } from './eclass.js';
import { EDataType } from './edata-type.js';
import { EObject } from './eobject.js';
import { EPackage } from './epackage.js';

/** Creates instances of a package's classes and converts its data type values to and from strings. */
export interface EFactory {
  /** The package this factory serves. EPackage.setEFactoryInstance() sets this automatically. */
  getEPackage(): EPackage | undefined;
  setEPackage(pkg: EPackage | undefined): void;

  /**
   * Creates a new, empty instance of `eClass`.
   *
   * @throws if `eClass` is abstract or an interface.
   */
  create(eClass: EClass): EObject;

  /**
   * Parses a serialized value of `eDataType`. Built-in types (EString,
   * EInt, ELong, EDouble, EFloat, EBoolean, EDate) are matched by name;
   * unknown types return `literalValue` unchanged.
   */
  createFromString(eDataType: EDataType, literalValue: string): unknown;

  /** Inverse of createFromString(): serializes a value of `eDataType` to a string. */
  convertToString(eDataType: EDataType, instanceValue: unknown): string;
}
