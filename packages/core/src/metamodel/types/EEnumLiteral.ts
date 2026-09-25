import { EEnum, EEnumerator, ENamedElement } from "../../index.js";

export interface EEnumLiteral extends ENamedElement {
  getValue(): number | undefined;
  setValue(value: number | undefined): void;

  getInstance(): EEnumerator | undefined;
  setInstance(value: EEnumerator | undefined): void;

  getLiteral(): string | undefined;
  setLiteral(value: string | undefined): void;

  getEEnum(): EEnum | undefined;
  setEEnum(value: EEnum | undefined): void;
}
