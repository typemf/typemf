import { EClass } from '../types/EClass.js';
import { EDataType } from '../types/EDataType.js';
import { EList } from '../types/EList.js';
import { EObject } from '../types/EObject.js';
import { EStringToStringMapEntry } from '../types/EStringToStringMapEntry.js';
import { EStringToStringMapEntryImpl } from './EStringToStringMapEntryImpl.js';

/**
 * Creates an instance of `eClass` with its package's factory.
 *
 * @throws Error if the package has no factory, or `eClass` is abstract or an interface.
 */
export function createInstanceOf(eClass: EClass): EObject {
  const pkg = eClass.getEPackage();
  const factory = pkg?.getEFactoryInstance();
  if (!factory) {
    throw new Error(
      `Cannot create an instance of '${eClass.getName()}': its EPackage has no EFactoryInstance registered. ` +
        'Generated packages set one themselves; for a package loaded from a .ecore file, call setEFactoryInstance(new DynamicEFactoryImpl()).'
    );
  }
  return factory.create(eClass);
}

/** The value stored under `key` in an annotation's `getDetails()`, or `undefined` if there is none. */
export function detailValue(details: EList<EStringToStringMapEntry>, key: string): string | undefined {
  return details.find((entry) => entry.getKey() === key)?.getValue();
}

/** Stores `value` under `key` in an annotation's `getDetails()`, replacing an existing value. */
export function setDetailValue(details: EList<EStringToStringMapEntry>, key: string, value: string): void {
  const existing = details.find((entry) => entry.getKey() === key);
  if (existing) {
    existing.setValue(value);
    return;
  }
  const entry = new EStringToStringMapEntryImpl();
  entry.setKey(key);
  entry.setValue(value);
  details.add(entry);
}

/**
 * Converts `literal`, the string form used in documents, to a value of `eDataType` with the
 * factory of the data type's package, as EMF's `EcoreUtil.createFromString`. Without a factory,
 * returns `literal` unchanged.
 *
 * @throws Error if `literal` is not a valid value of `eDataType`.
 */
export function createFromString(eDataType: EDataType, literal: string): unknown {
  const factory = eDataType.getEPackage()?.getEFactoryInstance();
  return factory ? factory.createFromString(eDataType, literal) : literal;
}

/**
 * Converts `value`, a value of `eDataType`, to the string form used in documents with the factory
 * of the data type's package, as EMF's `EcoreUtil.convertToString`. Returns `undefined` for
 * `undefined` or `null`; without a factory, uses `String(value)`.
 */
export function convertToString(eDataType: EDataType, value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const factory = eDataType.getEPackage()?.getEFactoryInstance();
  return factory ? factory.convertToString(eDataType, value) : String(value);
}
