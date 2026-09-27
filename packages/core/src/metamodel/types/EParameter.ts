import { EObject } from './EObject.js';
import { EList } from './EList.js';
import { ETypedElement } from './ETypedElement.js';
import { EOperation } from './EOperation.js';


export interface EParameter extends ETypedElement {

  getEOperation(): EOperation | undefined;
  setEOperation(value: EOperation | undefined): void;
}
