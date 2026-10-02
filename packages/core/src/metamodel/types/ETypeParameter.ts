import { EGenericType } from './EGenericType.js';
import { EList } from './EList.js';
import { ENamedElement } from './ENamedElement.js';

export interface ETypeParameter extends ENamedElement {
  getEBounds(): EList<EGenericType>;
}
