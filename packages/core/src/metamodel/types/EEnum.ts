import { EDataType, EEnumLiteral, EList } from "../../index.js";

export interface EEnum extends EDataType {
  getELiterals(): EList<EEnumLiteral>;

  getEEnumLiteral(name: string): EEnumLiteral;

  getEEnumLiteral(value: number): EEnumLiteral;

  getEEnumLiteralByLiteral(literal: string): EEnumLiteral;
}
