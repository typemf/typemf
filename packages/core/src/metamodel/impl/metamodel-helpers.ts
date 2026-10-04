import { EClass } from '../types/EClass.js';
import { EList } from '../types/EList.js';
import { EObject } from '../types/EObject.js';
import { EStringToStringMapEntry } from '../types/EStringToStringMapEntry.js';
import { EStringToStringMapEntryImpl } from './EStringToStringMapEntryImpl.js';

/**
 * Free functions with no interface/generated equivalent, deliberately kept OUT of any file the
 * self-hosting swap overwrites (EClassImpl.ts, EAnnotationImpl.ts) - none of these correspond to a real
 * Ecore.ecore operation, so none of them would ever be regenerated; putting them in a class file the
 * swap replaces wholesale would silently delete them the moment the swap happens. Found the hard way:
 * the first version of this migration put createInstanceOf/detailValue/setDetailValue directly in
 * EClassImpl.ts/EAnnotationImpl.ts, and merging generated code over those files made every caller
 * across the whole monorepo fail with "has no exported member" - confirmed by actually running the
 * merge, not assumed.
 */

/**
 * `eClass.getEPackage()?.getEFactoryInstance()?.create(eClass)`, with a clear error instead of silently
 * returning `undefined` when there is no factory to ask. Not an `EClass` interface method (it used to
 * be `EClass.createInstance()`) - a TypeMF-specific convenience, not part of real EMF's own `EClass`
 * API or derived from any Ecore.ecore operation, so it does not belong on the interface: keeping it
 * there would mean GENERATED `EClass` would need to replicate it forever, a permanent, unnecessary
 * divergence from the real model. Works identically whether `eClass` is hand-written or generated,
 * since it only calls the ordinary, real `getEPackage()`/`getEFactoryInstance()`/`create()` methods
 * every `EClass` already has.
 */
export function createInstanceOf(eClass: EClass): EObject {
  const pkg = eClass.getEPackage();
  const factory = pkg?.getEFactoryInstance();
  if (!factory) {
    throw new Error(
      `Cannot create an instance of '${eClass.getName()}': its EPackage has no EFactoryInstance registered. ` +
        'Generated packages register one at import time; a purely parsed .ecore package needs setEFactoryInstance(new DynamicEFactoryImpl()) called on it once, or EcoreParser to have done so automatically.'
    );
  }
  return factory.create(eClass);
}

/**
 * The value for `key` in `details` (an EAnnotation's `getDetails()`), or undefined if there is no
 * entry with that key. `details` is a real EList<EStringToStringMapEntry> (matching real EMF and
 * self-hosted generated code), not a Map - this is the key-based convenience most callers actually
 * want, so they don't have to hand-walk the list themselves for every read.
 */
export function detailValue(details: EList<EStringToStringMapEntry>, key: string): string | undefined {
  return details.find((entry) => entry.getKey() === key)?.getValue();
}

/**
 * Sets `key`'s value in `details` to `value`, updating an existing entry in place if one already has
 * that key, or adding a new one (a real EStringToStringMapEntryImpl) otherwise. The write-side
 * counterpart of detailValue().
 */
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
