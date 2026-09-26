import { EObject, EList } from './index.js';
import { ENamedElement } from './ENamedElement.js';
import { EClassifier } from './EClassifier.js';
import { EGenericType } from './EGenericType.js';


export interface ETypedElement extends ENamedElement {

  isOrdered(): boolean;
  setOrdered(value: boolean): void;

  isUnique(): boolean;
  setUnique(value: boolean): void;

  getLowerBound(): number;
  setLowerBound(value: number): void;

  getUpperBound(): number;
  setUpperBound(value: number): void;

  isMany(): boolean;

  isRequired(): boolean;

  getEType(): EClassifier | undefined;
  setEType(value: EClassifier | undefined): void;

  getEGenericType(): EGenericType | undefined;
  setEGenericType(value: EGenericType | undefined): void;
}
