/**
 * Parses `text` into a real DOM Document, using whichever DOMParser is
 * actually available: the browser's native one (feature-detected, no
 * import needed), or @xmldom/xmldom's, dynamically imported only when
 * running in Node - this is the pattern designed back when @typemf/core's
 * own ecore/ parser was first discussed, applied for real here since XMI
 * needs genuine XML parsing (unlike @typemf/json, which only ever needed
 * JSON.parse - universal in both environments, nothing to dispatch on).
 *
 * Deliberately does not attempt DTD/external-entity resolution in either
 * path - @xmldom/xmldom does not fetch external resources at all, and
 * nothing here changes that, which is the property that matters for
 * loading a .xmi/.ecore file from a source you don't fully trust (a
 * workspace file authored by someone else, a third-party plugin's model).
 */
export async function parseXmlDocument(text: string): Promise<Document> {
  const globalDOMParser = (globalThis as { DOMParser?: typeof DOMParser }).DOMParser;

  if (globalDOMParser) {
    const doc = new globalDOMParser().parseFromString(text, 'application/xml') as unknown as Document;
    // Browsers report a parse failure by embedding a <parsererror> element
    // rather than throwing.
    const parseError = doc.getElementsByTagName('parsererror')[0];
    if (parseError) {
      throw new Error(`Failed to parse XML: ${parseError.textContent ?? 'unknown parse error'}`);
    }
    return doc;
  }

  // Node: @xmldom/xmldom reports errors via a callback rather than a
  // <parsererror> element, and rather than throwing synchronously on
  // warnings - collect and surface fatal ones explicitly.
  const xmldom = await import('@xmldom/xmldom');
  const errors: string[] = [];
  const parser = new xmldom.DOMParser({
    onError: (level: string, message: string) => {
      if (level === 'error' || level === 'fatalError') errors.push(message);
    },
  });
  const doc = parser.parseFromString(text, 'application/xml') as unknown as Document;
  if (errors.length > 0) {
    throw new Error(`Failed to parse XML: ${errors.join('; ')}`);
  }
  return doc;
}
