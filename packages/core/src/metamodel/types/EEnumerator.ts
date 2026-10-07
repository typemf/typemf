/**
 * A literal of an enumeration, as EMF's `Enumerator`. It is the declared type of
 * `EEnumLiteral.getInstance()`; generated TypeScript enums do not implement it.
 */
export interface EEnumerator {
  getValue(): number;
  getName(): string;
  getLiteral(): string;
}
