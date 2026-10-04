import { EList } from './EList.js';
import { EModelElement } from './EModelElement.js';
import { EObject } from './EObject.js';
import { EStringToStringMapEntry } from './EStringToStringMapEntry.js';

export interface EAnnotation extends EModelElement {
  getSource(): string | undefined;
  setSource(value: string | undefined): void;

  getDetails(): EList<EStringToStringMapEntry>;

  getEModelElement(): EModelElement | undefined;
  setEModelElement(value: EModelElement | undefined): void;

  getContents(): EList<EObject>;

  getReferences(): EList<EObject>;
}
