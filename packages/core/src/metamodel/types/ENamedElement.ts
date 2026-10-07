import { EModelElement } from './EModelElement.js';

/** A model element with a name. */
export interface ENamedElement extends EModelElement {
  /** The element's name. */
  getName(): string | undefined;
  setName(value: string | undefined): void;
}
