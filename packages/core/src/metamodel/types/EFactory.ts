import { EClass } from './EClass.js';
import { EDataType } from './EDataType.js';
import { EModelElement } from './EModelElement.js';
import { EObject } from './EObject.js';
import { EPackage } from './EPackage.js';

/** Creates instances of a package's classes and converts data values to and from strings. */
export interface EFactory extends EModelElement {
  /** The package whose classes this factory creates. */
  getEPackage(): EPackage | undefined;
  setEPackage(value: EPackage | undefined): void;
  /**
   * Creates an instance of `eClass`. A class this factory has no generated code for gets a dynamic
   * instance.
   *
   * @throws Error if `eClass` is abstract or an interface.
   */
  create(eClass: EClass): EObject;
  /**
   * Converts `literalValue`, the string form used in documents, to a value of `eDataType`.
   *
   * @throws Error if `eDataType` belongs to another package.
   */
  createFromString(eDataType: EDataType, literalValue: string): unknown;
  /**
   * Converts `instanceValue`, a value of `eDataType`, to the string form used in documents.
   *
   * @throws Error if `eDataType` belongs to another package.
   */
  convertToString(eDataType: EDataType, instanceValue: unknown): string | undefined;
}
