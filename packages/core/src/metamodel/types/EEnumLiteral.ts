import { EEnum } from './EEnum.js';
import { ENamedElement } from './ENamedElement.js';
import { EEnumerator } from './EEnumerator';

export interface EEnumLiteral extends ENamedElement {
  getValue(): number;
  setValue(value: number): void;

  getInstance(): EEnumerator | undefined;
  setInstance(value: EEnumerator | undefined): void;

  getLiteral(): string | undefined;
  setLiteral(value: string | undefined): void;

  getEEnum(): EEnum | undefined;
}
