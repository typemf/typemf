import { EClassifier } from "../../index.js";

export interface EDataType extends EClassifier {
  getSerializable(): boolean | undefined;
  setSerializable(value: boolean | undefined): void;
}
