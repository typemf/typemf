import { EAnnotation } from './EAnnotation.js';
import { EList } from './EList.js';
import { EObject } from './EObject.js';



export interface EModelElement extends EObject {

  getEAnnotations(): EList<EAnnotation>;

  getEAnnotation(source: string): EAnnotation | undefined;
}
