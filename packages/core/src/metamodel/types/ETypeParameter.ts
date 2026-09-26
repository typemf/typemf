import { EObject, EList } from './index.js';
import { ENamedElement } from './ENamedElement.js';
import { EGenericType } from './EGenericType.js';


export interface ETypeParameter extends ENamedElement {

  getEBounds(): EList<EGenericType>;
}
