import { EClassifier } from './EClassifier.js';
import { EList } from './EList.js';
import { EObject } from './EObject.js';
import { ETypeParameter } from './ETypeParameter.js';



export interface EGenericType extends EObject {

  getEUpperBound(): EGenericType | undefined;
  setEUpperBound(value: EGenericType | undefined): void;

  getETypeArguments(): EList<EGenericType>;

  getERawType(): EClassifier | undefined;

  getELowerBound(): EGenericType | undefined;
  setELowerBound(value: EGenericType | undefined): void;

  getETypeParameter(): ETypeParameter | undefined;
  setETypeParameter(value: ETypeParameter | undefined): void;

  getEClassifier(): EClassifier | undefined;
  setEClassifier(value: EClassifier | undefined): void;
}
