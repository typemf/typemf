import { EObject, EList } from './index.js';
import { EDataType } from './EDataType.js';
import { EEnumLiteral } from './EEnumLiteral.js';


export interface EEnum extends EDataType {

  getELiterals(): EList<EEnumLiteral>;

  getEEnumLiteral(name: string): EEnumLiteral;

  getEEnumLiteral(value: number): EEnumLiteral;

  getEEnumLiteralByLiteral(literal: string): EEnumLiteral;
}
