import { EClass } from './EClass.js';
import { EClassifier } from './EClassifier.js';
import { EGenericType } from './EGenericType.js';
import { EList } from './EList.js';
import { EParameter } from './EParameter.js';
import { ETypeParameter } from './ETypeParameter.js';
import { ETypedElement } from './ETypedElement.js';

/** An operation of a class, with parameters, a return type and exceptions. */
export interface EOperation extends ETypedElement {
  /** The class declaring this operation. */
  getEContainingClass(): EClass | undefined;
  /** The operation's type parameters. */
  getETypeParameters(): EList<ETypeParameter>;
  /** The operation's parameters, in order. */
  getEParameters(): EList<EParameter>;
  /** The exception types the operation may throw. */
  getEExceptions(): EList<EClassifier>;
  /** The exception types the operation may throw, with their type arguments. */
  getEGenericExceptions(): EList<EGenericType>;
  /** The operation's ID in the class declaring it, assigned by generated code. */
  getOperationID(): number;
  /**
   * Whether this operation overrides `someOperation`: it is declared in a subclass of
   * `someOperation`'s class, with the same name and parameter types.
   */
  isOverrideOf(someOperation: EOperation): boolean;
}
