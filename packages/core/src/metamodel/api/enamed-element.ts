import { EModelElement } from './emodel-element.js';

/** A model element with a name. */
export interface ENamedElement extends EModelElement {
  /** The element's name, e.g. a class, feature or package name. */
  getName(): string;
  setName(name: string): void;
}
