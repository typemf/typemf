import { EObject, EList } from "./index.js";
import { EAnnotation } from "./EAnnotation.js";

export interface EModelElement extends EObject {
  getEAnnotations(): EList<EAnnotation>;

  getEAnnotation(source: string): EAnnotation | undefined;
}
