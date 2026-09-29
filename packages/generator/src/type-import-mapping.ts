import { detailValue, EClassifier, EList, EModelElement, EStringToStringMapEntry } from '@typemf/core';

/** The annotation source that says what to import and where it is imported from. */
export const IMPORT_ANNOTATION_SOURCE = 'https://typemf.dev/generator/import';

/**
 * One import: which symbol, and where it comes from. (What TEXT a datatype
 * is emitted as is a separate matter - the `type` detail of the annotation
 * with source https://typemf.dev/generator; see resolveDataTypeTs. The two
 * usually name the same thing, but need not: the text may be `number |
 * undefined` while the symbol imported is something else.)
 *
 *  - `type`: the symbol to import.
 *  - `from`: the module other packages import it from - a module specifier,
 *    used as written (e.g. "@typemf/core"). Applies to an EXTERNAL use:
 *    the element belongs to a package other than the one being generated.
 *  - `internalFrom`: where the package being generated imports it from,
 *    relative to the ROOT of the generated package when it starts with
 *    "./" or "../" (see ImportEntry.from). Applies to an INTERNAL use: the
 *    element belongs to the package being generated. Falls back to `from`.
 */
export interface TypeImportInfo {
  type: string;
  from?: string;
  internalFrom?: string;
}

/** The same shape as the annotation's own detail keys, for entries supplied from outside the model (see TypeImportMapping). */
export type TypeImportEntries = Record<string, { type?: string; from?: string; 'internal-from'?: string }>;

const nonEmpty = (value: string | undefined): string | undefined => (value !== undefined && value !== '' ? value : undefined);

function info(type: string, from: string | undefined, internalFrom: string | undefined): TypeImportInfo {
  const result: TypeImportInfo = { type };
  if (from !== undefined) result.from = from;
  if (internalFrom !== undefined) result.internalFrom = internalFrom;
  return result;
}

function importInfoOf(details: EList<EStringToStringMapEntry> | undefined): TypeImportInfo | undefined {
  const type = nonEmpty(details && detailValue(details, 'type'));
  if (type === undefined) return undefined;
  return info(type, nonEmpty(details && detailValue(details, 'from')), nonEmpty(details && detailValue(details, 'internal-from')));
}

/**
 * The import information an element carries itself: the details `type`,
 * `from` and `internal-from` of its (first) annotation with source
 * https://typemf.dev/generator/import. Without a `type` the annotation says
 * nothing (there is no symbol to import) and is ignored. Values are used
 * as written - not checked, not interpreted; empty counts as absent.
 */
export function readImportAnnotation(element: EModelElement): TypeImportInfo | undefined {
  return importInfoOf(element.getEAnnotation(IMPORT_ANNOTATION_SOURCE)?.getDetails());
}

/**
 * EVERY import annotation on an element, in order - an element that needs
 * several imports (an operation whose body uses several symbols) carries
 * one annotation per import. Each is read like readImportAnnotation.
 */
export function readImportAnnotations(element: EModelElement): TypeImportInfo[] {
  const result: TypeImportInfo[] = [];
  for (const annotation of element.getEAnnotations()) {
    if (annotation.getSource() !== IMPORT_ANNOTATION_SOURCE) continue;
    const entry = importInfoOf(annotation.getDetails());
    if (entry !== undefined) result.push(entry);
  }
  return result;
}

/**
 * The one place import information for types is looked up. Today it is
 * fed by the annotations in the model (readImportAnnotation); explicit
 * entries - keyed `<package nsURI>#<classifier name>`, e.g.
 * "http://www.eclipse.org/emf/2002/Ecore#EEList" - take precedence over
 * an annotation and are the seam for supplying the same information from
 * outside the model (the generator config's mapping of ecore packages to
 * TypeScript modules): pre-populate them, and nothing else in the
 * generator changes. An explicit entry replaces the annotation entirely,
 * field by field is deliberately not merged.
 */
export class TypeImportMapping {
  private readonly explicit = new Map<string, TypeImportInfo>();

  constructor(entries: TypeImportEntries = {}) {
    for (const [key, entry] of Object.entries(entries)) {
      const type = nonEmpty(entry.type);
      if (type !== undefined) this.set(key, info(type, nonEmpty(entry.from), nonEmpty(entry['internal-from'])));
    }
  }

  static keyOf(classifier: EClassifier): string {
    return `${classifier.getEPackage()?.getNsURI() ?? ''}#${classifier.getName()}`;
  }

  set(key: string, value: TypeImportInfo): void {
    this.explicit.set(key, value);
  }

  lookup(classifier: EClassifier): TypeImportInfo | undefined {
    return this.explicit.get(TypeImportMapping.keyOf(classifier)) ?? readImportAnnotation(classifier);
  }
}
