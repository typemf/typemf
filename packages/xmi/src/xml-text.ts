/**
 * Writing XML is built as direct string generation rather than through a
 * DOM Document, deliberately asymmetric with the parse side: constructing
 * a spec-correct Document identically across native DOMParser and
 * @xmldom/xmldom is real complexity (they don't expose identical
 * `document.implementation.createDocument`/XMLSerializer behaviour), while
 * generating well-formed XML text with correct escaping is simple enough
 * to not need it. Reading genuinely needs a real parser (arbitrary,
 * possibly untrusted input); writing only needs to escape values we
 * already control.
 */

export function escapeAttributeValue(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r/g, '&#13;')
    .replace(/\n/g, '&#10;')
    .replace(/\t/g, '&#9;');
}

export function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
