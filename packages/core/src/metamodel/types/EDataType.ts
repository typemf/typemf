import { EClassifier } from './EClassifier.js';



export interface EDataType extends EClassifier {

  isSerializable(): boolean;
  setSerializable(value: boolean): void;
}
