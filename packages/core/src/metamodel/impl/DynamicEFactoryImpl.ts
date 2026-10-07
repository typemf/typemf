import { EClass } from '../types/EClass.js';
import { EObject } from '../types/EObject.js';
import { DynamicEObjectImpl } from './DynamicEObjectImpl.js';
import { EFactoryImpl } from './EFactoryImpl.js';

/**
 * A factory for any class, needing no generated code: it creates a {@link DynamicEObjectImpl}.
 * Set it on a package loaded from a `.ecore` file with `setEFactoryInstance()`.
 */
export class DynamicEFactoryImpl extends EFactoryImpl {
  /** @throws Error if `eClass` is abstract or an interface. */
  create(eClass: EClass): EObject {
    if (eClass.isAbstract() || eClass.isInterface()) {
      throw new Error(`Cannot instantiate '${eClass.getName()}': it is abstract or an interface.`);
    }
    return new DynamicEObjectImpl(eClass);
  }
}
