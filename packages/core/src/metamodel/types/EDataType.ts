import { EObject } from './EObject.js';
import { EList } from './EList.js';
import { EClassifier } from './EClassifier.js';


export interface EDataType extends EClassifier {

  isSerializable(): boolean;
  setSerializable(value: boolean): void;
}
