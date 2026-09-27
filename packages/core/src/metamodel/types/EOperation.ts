import { EObject } from './EObject.js';
import { EList } from './EList.js';
import { ETypedElement } from './ETypedElement.js';
import { EClass } from './EClass.js';
import { ETypeParameter } from './ETypeParameter.js';
import { EParameter } from './EParameter.js';
import { EClassifier } from './EClassifier.js';
import { EGenericType } from './EGenericType.js';


export interface EOperation extends ETypedElement {

  getEContainingClass(): EClass | undefined;
  setEContainingClass(value: EClass | undefined): void;

  getETypeParameters(): EList<ETypeParameter>;

  getEParameters(): EList<EParameter>;

  getEExceptions(): EList<EClassifier>;

  getEGenericExceptions(): EList<EGenericType>;

  getOperationID(): number;

  isOverrideOf(someOperation: EOperation): boolean;
}
