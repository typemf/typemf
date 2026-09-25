import { EClassifier, EList, EObject, ETypeParameter } from "../../index.js";

export interface EGenericType extends EObject {
  getEUpperBound(): EGenericType | undefined;
  setEUpperBound(value: EGenericType | undefined): void;

  getETypeArguments(): EList<EGenericType>;

  getERawType(): EClassifier | undefined;
  setERawType(value: EClassifier | undefined): void;

  getELowerBound(): EGenericType | undefined;
  setELowerBound(value: EGenericType | undefined): void;

  getETypeParameter(): ETypeParameter | undefined;
  setETypeParameter(value: ETypeParameter | undefined): void;

  getEClassifier(): EClassifier | undefined;
  setEClassifier(value: EClassifier | undefined): void;
}
