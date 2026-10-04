import { EDataType } from './EDataType.js';
import { EEnumLiteral } from './EEnumLiteral.js';
import { EList } from './EList.js';

export interface EEnum extends EDataType {
  getELiterals(): EList<EEnumLiteral>;

  getEEnumLiteral(name: string): EEnumLiteral | undefined;

  getEEnumLiteral(value: number): EEnumLiteral | undefined;

  getEEnumLiteralByLiteral(literal: string): EEnumLiteral | undefined;
}
