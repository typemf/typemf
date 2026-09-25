import { EOperation, ETypedElement } from "../../index.js";

export interface EParameter extends ETypedElement {
  getEOperation(): EOperation | undefined;
  setEOperation(value: EOperation | undefined): void;
}
