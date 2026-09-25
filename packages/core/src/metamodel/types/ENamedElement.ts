import { EModelElement } from "../../index.js";

export interface ENamedElement extends EModelElement {
  getName(): string | undefined;
  setName(value: string | undefined): void;
}
