import { EClass } from '../api/eclass.js';
import { EObject } from '../api/eobject.js';
import { DynamicEObjectImpl } from './dynamic-eobject-impl.js';
import { EFactoryImpl } from './efactory-impl.js';

/**
 * The generic factory: unlike a generated per-package factory (a hardcoded
 * switch over classifier id calling `new XxxImpl()`), this works for any
 * EClass without any code having been generated for it. This is what
 * EcoreParser attaches to a package it parses from raw .ecore XML, and is
 * the piece that was missing from the original TMF for a truly dynamic,
 * no-codegen instantiation path.
 */
export class DynamicEFactoryImpl extends EFactoryImpl {
  create(eClass: EClass): EObject {
    if (eClass.isAbstract() || eClass.isInterface()) {
      throw new Error(`Cannot instantiate '${eClass.getName()}': it is abstract or an interface.`);
    }
    return new DynamicEObjectImpl(eClass);
  }
}
