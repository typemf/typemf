import { EObject } from './EObject.js';
import { EList } from './EList.js';
import { EAnnotation } from './EAnnotation.js';


export interface EModelElement extends EObject {

  getEAnnotations(): EList<EAnnotation>;

  getEAnnotation(source: string): EAnnotation | undefined;
}
