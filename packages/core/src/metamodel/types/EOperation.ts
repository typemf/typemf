import { EClass } from './EClass.js';
import { EClassifier } from './EClassifier.js';
import { EGenericType } from './EGenericType.js';
import { EList } from './EList.js';
import { EParameter } from './EParameter.js';
import { ETypeParameter } from './ETypeParameter.js';
import { ETypedElement } from './ETypedElement.js';

export interface EOperation extends ETypedElement {
  getEContainingClass(): EClass | undefined;

  getETypeParameters(): EList<ETypeParameter>;

  getEParameters(): EList<EParameter>;

  getEExceptions(): EList<EClassifier>;

  getEGenericExceptions(): EList<EGenericType>;

  getOperationID(): number;

  isOverrideOf(someOperation: EOperation): boolean;
}
