import { EOperation } from './EOperation.js';
import { ETypedElement } from './ETypedElement.js';

/** A parameter of an operation. */
export interface EParameter extends ETypedElement {
  /** The operation this parameter belongs to. */
  getEOperation(): EOperation | undefined;
}
