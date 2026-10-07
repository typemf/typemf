import { EList } from './EList.js';
import { ENamedElement } from './ENamedElement.js';
import { EPackage } from './EPackage.js';
import { ETypeParameter } from './ETypeParameter.js';
import { TypeScriptClass } from './TypeScriptClass';

/** A type that typed elements refer to: a class or a data type. */
export interface EClassifier extends ENamedElement {
  /** The name of the implementation type of the instances, if set. */
  getInstanceClassName(): string | undefined;
  setInstanceClassName(value: string | undefined): void;
  /** The implementation class of the instances, if known. */
  getInstanceClass(): TypeScriptClass<unknown> | undefined;
  /**
   * The value of an unset feature of this type, e.g. `0` for a numeric data type, `false` for
   * `EBoolean` and `undefined` for a class.
   */
  getDefaultValue(): unknown;
  /** Like `instanceClassName`, but may include type arguments. */
  getInstanceTypeName(): string | undefined;
  setInstanceTypeName(value: string | undefined): void;
  /** The package containing this classifier. */
  getEPackage(): EPackage | undefined;
  /** The classifier's type parameters. */
  getETypeParameters(): EList<ETypeParameter>;
  /**
   * Whether `object` is a value of this type: for a class, a model object of this class or a
   * subclass; for a data type, a JavaScript value of the matching kind.
   */
  isInstance(object: unknown): boolean;
  /** The classifier's ID within its package, assigned by generated code. */
  getClassifierID(): number;
}
