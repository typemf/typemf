import { EList } from './EList.js';
import { ENamedElement } from './ENamedElement.js';
import { EPackage } from './EPackage.js';
import { ETypeParameter } from './ETypeParameter.js';
import { TypeScriptClass } from './TypeScriptClass';

export interface EClassifier extends ENamedElement {
  getInstanceClassName(): string | undefined;
  setInstanceClassName(value: string | undefined): void;

  getInstanceClass(): TypeScriptClass<unknown> | undefined;

  getDefaultValue(): unknown;

  getInstanceTypeName(): string | undefined;
  setInstanceTypeName(value: string | undefined): void;

  getEPackage(): EPackage | undefined;

  getETypeParameters(): EList<ETypeParameter>;

  isInstance(object: unknown): boolean;

  getClassifierID(): number;
}
