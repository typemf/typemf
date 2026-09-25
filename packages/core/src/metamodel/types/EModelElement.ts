import { EAnnotation, EList, EObject } from "../../index.js";

export interface EModelElement extends EObject {
  getEAnnotations(): EList<EAnnotation>;

  getEAnnotation(source: string): EAnnotation;
}
