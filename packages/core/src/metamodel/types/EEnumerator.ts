/**
 * The interface every generated TypeScript `enum` for an Ecore `EEnum` classifier is expected to
 * satisfy reflectively - the analog of real EMF's own `org.eclipse.emf.common.util.Enumerator`.
 * Real EMF's generated Java enum constants implement this directly; this port's generated enums are
 * plain native TypeScript `enum`s (see eenum.njk), which don't implement interfaces at all, so nothing
 * currently constructs a real `EEnumerator` value - this exists purely so `EEnumLiteral.instance`
 * (which references it) has a real, importable type to point at, matching real EMF's declared shape
 * exactly, even though this port has no reflective bridge from a literal to one yet.
 */
export interface EEnumerator {
  getValue(): number;
  getName(): string;
  getLiteral(): string;
}
