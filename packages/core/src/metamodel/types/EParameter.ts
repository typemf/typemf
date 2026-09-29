import { EOperation } from './EOperation.js';
import { ETypedElement } from './ETypedElement.js';



export interface EParameter extends ETypedElement {

  getEOperation(): EOperation | undefined;
}
