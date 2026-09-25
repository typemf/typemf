import { EGenericType, ENamedElement, EList } from "../../index.js";

export interface ETypeParameter extends ENamedElement {
  getEBounds(): EList<EGenericType>;
}
