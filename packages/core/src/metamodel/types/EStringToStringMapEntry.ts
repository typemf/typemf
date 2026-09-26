import { EObject, EList } from './index.js';


export interface EStringToStringMapEntry extends EObject {

  getKey(): string | undefined;
  setKey(value: string | undefined): void;

  getValue(): string | undefined;
  setValue(value: string | undefined): void;
}
