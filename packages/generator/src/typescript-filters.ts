import { generationContext, isExternal } from './generation-context.js';
import { importCollector } from './import-collector.js';
import { readImportAnnotations } from './type-import-mapping.js';
import {
  detailValue,
  EAnnotation,
  EClass,
  EClassifier,
  EDataType,
  EEnum,
  EGenericType,
  EModelElement,
  EOperation,
  EPackage,
  EStructuralFeature,
  ETypedElement,
  isEDataType as isDataTypeObject,
} from '@typemf/core';

/** The generator's own annotation source. */
export const TYPEMF_GENERATOR_ANNOTATION_SOURCE = 'https://typemf.dev/generator';

/** Real EMF's own GenModel annotation source - where its GenModel keeps an operation's `body`. */
export const ECLIPSE_GENMODEL_ANNOTATION_SOURCE = 'http://www.eclipse.org/emf/2002/GenModel';

/** Real EMF's Ecore annotation source - the documentation fallback (real Ecore.ecore uses it for `constraints`). */
export const ECLIPSE_ECORE_ANNOTATION_SOURCE = 'http://www.eclipse.org/emf/2002/Ecore';

/**
 * The layering rule shared by everything that is read from an element's
 * annotations under a plain key: the `key` detail of the annotation with
 * source https://typemf.dev/generator first, then the same key in the
 * annotation with source `fallbackSource`. Which fallback source applies
 * is decided per thing being read (see documentationOf, operationBody),
 * not globally. Used as written - not checked, not interpreted; an empty
 * value counts as absent (so it falls through to the next layer).
 */
export function layeredAnnotationDetail(
  element: EModelElement,
  key: string,
  fallbackSource: string
): string | undefined {
  for (const source of [TYPEMF_GENERATOR_ANNOTATION_SOURCE, fallbackSource]) {
    const details = element.getEAnnotation(source)?.getDetails();
    const value = details && detailValue(details, key);
    if (value !== undefined && value !== '') return value;
  }
  return undefined;
}

/**
 * An element's documentation: the `documentation` detail, layered - the
 * typemf generator annotation first, the annotation with source
 * http://www.eclipse.org/emf/2002/Ecore as the fallback.
 *
 * NOTE: real EMF keeps `documentation` in the GenModel source
 * (http://www.eclipse.org/emf/2002/GenModel), not the Ecore one - so that
 * is deliberately NOT read here: documentation an EMF-authored .ecore
 * carries under GenModel is ignored unless it is also supplied under one
 * of the two sources above.
 */
export function documentationOf(element: EModelElement): string | undefined {
  return layeredAnnotationDetail(element, 'documentation', ECLIPSE_ECORE_ANNOTATION_SOURCE);
}

/** Lines of generated doc comments are wrapped to this width, indentation included. */
const DOC_COMMENT_WIDTH = 100;

/**
 * Renders a JSDoc block from documentationOf(), or '' if there is none. Lines longer than
 * {@link DOC_COMMENT_WIDTH} are wrapped at spaces; shorter lines are kept as written. Has no
 * trailing newline, since every template puts the declaration on the next line itself.
 */
export function docComment(element: EModelElement, indent = ''): string {
  const doc = documentationOf(element)?.trim();
  if (!doc) return '';
  const single = `${indent}/** ${doc} */`;
  if (!doc.includes('\n') && single.length <= DOC_COMMENT_WIDTH) return single;
  const width = DOC_COMMENT_WIDTH - `${indent} * `.length;
  const lines = doc.split('\n').flatMap((line) => wrapLine(line, width));
  const body = lines.map((line) => (line === '' ? `${indent} *` : `${indent} * ${line}`)).join('\n');
  return `${indent}/**\n${body}\n${indent} */`;
}

/** `line` split at spaces into lines of at most `width` characters; a longer word stays whole. */
function wrapLine(line: string, width: number): string[] {
  if (line.length <= width) return [line];
  const lines: string[] = [];
  let current = '';
  for (const word of line.split(' ')) {
    if (current !== '' && current.length + 1 + word.length > width) {
      lines.push(current);
      current = word;
    } else {
      current = current === '' ? word : `${current} ${word}`;
    }
  }
  lines.push(current);
  return lines;
}

/**
 * An operation's body, in strict priority order:
 *
 *  1. the `body` detail of the annotation with source
 *     https://typemf.dev/generator
 *  2. the `body` detail of the annotation with source
 *     http://www.eclipse.org/emf/2002/GenModel
 *
 * Used as written - not checked, not interpreted; an empty value counts
 * as absent (the operation then gets the throwing stub). Note the second
 * layer is real EMF's own key, where the value is Java source: a real
 * EMF-authored .ecore that carries Java bodies there will have that Java
 * emitted verbatim unless a layer-1 body overrides it - which is the
 * point of the ordering, and the reason a layer-1 body should be added
 * to any operation whose GenModel body isn't valid TypeScript.
 *
 * (Earlier versions read a per-template-set key, `body:typescript`, on
 * the reasoning that one shared key would be ambiguous across multiple
 * target languages. Replaced on request by these two layers.)
 */
export function operationBody(operation: EOperation): string | undefined {
  return layeredAnnotationDetail(operation, 'body', ECLIPSE_GENMODEL_ANNOTATION_SOURCE);
}

/**
 * The annotation source for a structural feature's own custom getter/setter
 * bodies: `get` and `set` details of the annotation with source
 * https://typemf.dev/generator/feature. Deliberately NOT layered with a
 * GenModel fallback (unlike documentationOf/operationBody) - this source
 * was specified on its own, with no second layer requested.
 */
export const FEATURE_ANNOTATION_SOURCE = 'https://typemf.dev/generator/feature';

function featureDetail(feature: EStructuralFeature, key: string): string | undefined {
  const details = feature.getEAnnotation(FEATURE_ANNOTATION_SOURCE)?.getDetails();
  const value = details && detailValue(details, key);
  return value !== undefined && value !== '' ? value : undefined;
}

/**
 * A feature's custom getter body (`get` detail), used verbatim as the body
 * of its bean getter method - and, so reflective access agrees with the
 * real implementation (the bug found and fixed for
 * EClass.getEAllStructuralFeatures: the generated eGet used to read the
 * STORED FIELD directly, bypassing any computed getter entirely), as what
 * `eGet` calls too. A feature with a custom getter has NO stored field at
 * all - there is nothing for the old field-reading shape to read.
 */
export function featureGetter(feature: EStructuralFeature): string | undefined {
  return featureDetail(feature, 'get');
}

/**
 * A feature's custom setter body (`set` detail), used verbatim as the body
 * of its bean setter method, and what `eSet` delegates to reflectively -
 * replacing the default oldValue/eBasicSetValue/eDidAdd/eDidRemove
 * machinery entirely, since a custom setter defines the feature's true
 * write semantics itself. Only meaningful for a SINGLE-valued feature: a
 * many-valued feature never has a setter method to begin with (real EMF
 * convention - the getter's EList is mutated directly), so a `set` on one
 * is a no-op, flagged by findFeatureAnnotationProblems.
 */
export function featureSetter(feature: EStructuralFeature): string | undefined {
  return featureDetail(feature, 'set');
}

/**
 * Whether a feature with both a custom getter and a custom setter genuinely needs its own backing
 * field - true only when at least one of the two bodies actually references it (`this._name`).
 * EEnumLiteral.literal's getter/setter do ("this._literal ?? this.getName()", "this._literal =
 * value") - it needs a field. A feature whose getter/setter delegate entirely to a DIFFERENT
 * feature (e.g. a "shout" getter/setter that only ever reads/writes "raw") does not - declaring an
 * unused field for it would be dead weight, and checking `eIsSet`/`eUnset` against that field would
 * be flatly wrong (the field never changes, so "is set" would never reflect reality). Found by
 * running this exact case: an earlier version of this rule declared a field for EVERY getter+setter
 * pair unconditionally, breaking any feature that delegates to another one entirely.
 */
export function customBodyNeedsOwnField(feature: EStructuralFeature): boolean {
  const getter = featureGetter(feature);
  const setter = featureSetter(feature);
  if (!getter && !setter) return false;
  const ownFieldRef = new RegExp(`\\bthis\\._${feature.getName()}\\b`);
  return (getter !== undefined && ownFieldRef.test(getter)) || (setter !== undefined && ownFieldRef.test(setter));
}

/**
 * Whether a single-valued feature has no setter at all: either a
 * trivialDerivedFormula (pre-existing, hard-coded), or a custom getter
 * with no custom setter (a feature computed by featureGetter, and nothing
 * says how to write it back). A many-valued feature is unaffected by this
 * (it never has a setter regardless).
 */
export function isReadOnlyFeature(feature: EStructuralFeature): boolean {
  return (
    trivialDerivedFormula(feature) !== undefined ||
    (featureGetter(feature) !== undefined && featureSetter(feature) === undefined)
  );
}

/**
 * A changeable=false feature that isn't otherwise read-only (not derived, no custom getter) still
 * needs a real setter SOMEWHERE - real EMF's own convention (matches this session's earlier
 * containerClass work): a plain, impl-only setter that bypasses eSet/eDidAdd/eDidRemove entirely
 * (direct field assignment, no notification), reachable only by callers with the concrete impl type
 * (bootstrap code, the loader), never through the public interface or reflective eSet.
 */
export function needsImplOnlySetter(feature: EStructuralFeature): boolean {
  return !isReadOnlyFeature(feature) && !feature.isChangeable();
}

/** findDataTypeAnnotationProblems's counterpart for feature get/set annotations: a `set` on a many-valued feature is a no-op (see featureSetter), reported rather than silently ignored. */
export function findFeatureAnnotationProblems(pkg: EPackage): string[] {
  const problems: string[] = [];
  for (const classifier of pkg.getEClassifiers()) {
    if (!isEClass(classifier)) continue;
    for (const feature of classifier.getEStructuralFeatures()) {
      if (feature.isMany() && featureSetter(feature) !== undefined) {
        problems.push(
          `${classifier.getName()}.${feature.getName()}: has a \`set\` annotation, but is many-valued - many-valued features never have a setter, so it is ignored`
        );
      }
    }
  }
  return problems;
}

/**
 * Real, correct formula bodies for the four derived ETypedElement/
 * EReference features that are trivially computable from the same
 * instance's OTHER stored fields - deliberately NOT extended to the
 * ~14 traversal-based derived features real Ecore.ecore also has
 * (eAllSuperTypes, eAllStructuralFeatures, ...): those would need a real,
 * generically-applicable traversal algorithm, which risks exactly the
 * kind of rushed, undertested logic this project has repeatedly caught
 * bugs in when attempted under time pressure. Applied only at the bean
 * accessor level (getMany(), not the reflective eGet() switch) - a
 * narrow, deliberate, documented inconsistency between the two access
 * paths for just these four features, not a general pattern.
 */
const TRIVIAL_DERIVED_FORMULAS: Record<string, string> = {
  many: 'this.getUpperBound() === -1 || this.getUpperBound() > 1',
  // Verified directly against real EMF's own ETypedElementImpl.isRequired()
  // source (org.eclipse.emf.ecore.impl) while implementing the equivalent
  // reflective dispatch in @typemf/core: it is exactly `lowerBound >= 1`,
  // with NO `!many` check. An earlier version of this formula incorrectly
  // added one; caught only because the hand-written @typemf/core port
  // (built independently, then checked against the same source) disagreed
  // with this file.
  required: 'this.getLowerBound() >= 1',
  container: '(this.getEOpposite()?.isContainment() ?? false)',
  eReferenceType: '(this.getEType() as EClass | undefined)',
  eAttributeType: '(this.getEType() as EDataType | undefined)',
};

/** The real formula body for a trivially-computable derived feature, or undefined if `feature` isn't one of the four. */
export function trivialDerivedFormula(feature: EStructuralFeature): string | undefined {
  if (!feature.isDerived()) return undefined;
  return TRIVIAL_DERIVED_FORMULAS[feature.getName()!];
}

/**
 * The TypeScript type name for a classifier's scalar form (no EList
 * wrapping). `undefined` specifically means "this feature's type is
 * Ecore's own EObject classifier" - the generator never produces its own
 * api/gen/impl files for a classifier named "EObject" (matches the
 * existing no-declared-supertype convention, which already falls back to
 * the real @typemf/core EObject rather than generating a redundant,
 * shadowing one - see eclass.njk / main.njk). The dynamic-to-typed
 * conversion step that builds a real metamodel from a parsed .ecore file
 * deliberately leaves such a feature's eType unset for exactly this
 * reason, so `undefined` reaching here always means EObject.
 */
export function tsScalarType(type: EClassifier | ETypedElement | undefined): string {
  if (type !== undefined && isTypedElement(type)) return tsTypeReference(type.getEType(), type.getEGenericType());
  return tsTypeReference(type, undefined);
}

/** ETypedElement vs EClassifier - only a typed element has getEType(). */
function isTypedElement(x: EClassifier | ETypedElement): x is ETypedElement {
  return 'getEType' in x;
}

/**
 * The TypeScript text for a reference to `classifier`, including type
 * arguments when the classifier is generic (declares eTypeParameters):
 * one argument per declared parameter, in order - the corresponding
 * eTypeArgument of `genericType` where it is present and bound (to a
 * classifier, or to an enclosing type parameter), and `unknown` where it
 * is missing or unbound (Ecore's `<eTypeArguments/>`). So an EJavaClass
 * used with no argument at all and one used with an explicitly empty
 * argument both read `TypeScriptClass<unknown>`, and EJavaClass<EString>
 * reads `TypeScriptClass<string>` (through the argument's own datatype
 * resolution).
 */
function tsTypeReference(classifier: EClassifier | undefined, genericType: EGenericType | undefined): string {
  const base = tsBaseType(classifier);
  const parameterCount = classifier?.getETypeParameters().size() ?? 0;
  if (parameterCount === 0) return base;
  const given = genericType?.getETypeArguments();
  const args: string[] = [];
  for (let i = 0; i < parameterCount; i++) {
    const argument = given !== undefined && i < given.size() ? given.get(i) : undefined;
    args.push(argument === undefined ? 'unknown' : tsGenericArgument(argument));
  }
  return `${base}<${args.join(', ')}>`;
}

function tsGenericArgument(argument: EGenericType): string {
  const classifier = argument.getEClassifier();
  if (classifier) return tsTypeReference(classifier, argument);
  const parameter = argument.getETypeParameter();
  if (parameter) return parameter.getName()!;
  return 'unknown';
}

/**
 * Every classifier bound anywhere inside `genericType`'s type arguments,
 * recursively (not `genericType`'s own classifier - that is the element's
 * eType, handled separately) - needed so the templates can register the
 * imports the emitted type arguments require.
 */
export function genericArgumentClassifiers(genericType: EGenericType | undefined): EClassifier[] {
  const result: EClassifier[] = [];
  const visit = (gt: EGenericType) => {
    for (const argument of gt.getETypeArguments()) {
      const classifier = argument.getEClassifier();
      if (classifier) result.push(classifier);
      visit(argument);
    }
  };
  if (genericType) visit(genericType);
  return result;
}

/** The type's own name/text with no type arguments: EObject for an absent type, the layered datatype text, or the classifier's name. */
function tsBaseType(classifier: EClassifier | undefined): string {
  if (!classifier) {
    // Emitting a bare "EObject" is a real reference to the foundational
    // type - record it, same as any other emitted type. (Missed by the
    // first cut of the import-collector rewrite: confirmed against real
    // Ecore.ecore, where EAnnotation.contents/references - typed EObject,
    // whose eType the loader deliberately leaves unset - generated an
    // "EObject" with no import at all.)
    importCollector.add({ name: 'EObject', location: 'types', foundational: true });
    return 'EObject';
  }
  if (isEDataType(classifier)) return tsPrimitiveType(classifier);
  // EClass or EEnum: the generated api-layer type shares the classifier's own name.
  return classifier.getName()!;
}

export interface ResolvedDataTypeText {
  /** The TypeScript type text to emit wherever this datatype is used. */
  text: string;
  /** The import this use needs, if the datatype has import information that applies (see resolveDataTypeTs): the symbol and the module it comes from (see ImportEntry.from). Independent of where `text` came from. */
  importName?: string;
  importFrom?: string;
}

/**
 * The layered resolution of what TypeScript type text an EDataType
 * stands for, wherever it occurs (attribute/reference type, operation
 * return type, parameter type, ...), in strict priority order - and with
 * NO built-in knowledge of any datatype: every mapping comes from the
 * metamodel (or the mapping supplied alongside it), and a missing one is
 * a fix there, not something the generator papers over.
 *
 *  1. The `type` detail of the datatype's annotation with source
 *     https://typemf.dev/generator - the text, as written.
 *  2. The datatype's `instanceClassName`, as written, if set.
 *  3. The datatype's name, as written.
 *
 * Separately from which layer supplied the text, the datatype's IMPORT
 * information (TypeImportMapping: the explicit mapping entry if there is
 * one, else its annotation with source https://typemf.dev/generator/import)
 * says what to import when it is used: its `type` symbol, from `from` if
 * the datatype is EXTERNAL (belongs to a package other than the one being
 * generated) or from `internal-from` (falling back to `from`) if INTERNAL.
 * If the key that applies is absent, no import is registered - the text is
 * still emitted, so a missing import shows up as a compile error naming
 * the type.
 *
 * Nothing is checked or interpreted.
 */
export function resolveDataTypeTs(dataType: EDataType): ResolvedDataTypeText {
  const resolved = resolveDataTypeText(dataType);
  const importInfo = generationContext.typeImports.lookup(dataType);
  if (importInfo !== undefined) {
    const source = isExternal(dataType) ? importInfo.from : (importInfo.internalFrom ?? importInfo.from);
    if (source !== undefined) return { ...resolved, importName: importInfo.type, importFrom: source };
  }
  return resolved;
}

function resolveDataTypeText(dataType: EDataType): ResolvedDataTypeText {
  const ownDetails = dataType.getEAnnotation(TYPEMF_GENERATOR_ANNOTATION_SOURCE)?.getDetails();
  const annotated = ownDetails && detailValue(ownDetails, 'type');
  if (annotated !== undefined && annotated !== '') return { text: annotated };
  const instanceClassName = dataType.getInstanceClassName();
  if (instanceClassName !== undefined && instanceClassName !== '') return { text: instanceClassName };
  return { text: dataType.getName()! };
}

/**
 * Registers the imports a body declares - an operation's, or (see
 * FEATURE_ANNOTATION_SOURCE) a feature's custom getter/setter: one
 * annotation with source https://typemf.dev/generator/import per import
 * (`type` = the symbol; `from` / `internal-from` reuse a datatype's detail
 * names, but NOT its external/internal MEANING - see below).
 *
 * A body is always internal: it is source code that becomes part of the
 * package being generated, in every generation, never a reference to a
 * type belonging to some other package. So there is no isExternal()
 * check here (contrast resolveDataTypeTs, where a datatype genuinely can
 * belong to a different package) - `internal-from` applies, falling back
 * to `from` only as an alternate spelling of the same (internal) path,
 * not as a distinct external case. Returns '' - it is called for its
 * effect, from the template that emits the body.
 */
export function registerBodyImports(element: EModelElement): string {
  for (const entry of readImportAnnotations(element)) {
    const source = entry.internalFrom ?? entry.from;
    if (source !== undefined)
      importCollector.add({ name: entry.type, location: 'root', foundational: false, from: source });
  }
  return '';
}

function tsPrimitiveType(dataType: EDataType): string {
  const resolved = resolveDataTypeTs(dataType);
  if (resolved.importName !== undefined && resolved.importFrom !== undefined) {
    importCollector.add({
      name: resolved.importName,
      location: 'root',
      foundational: false,
      from: resolved.importFrom,
    });
  }
  return resolved.text;
}

/**
 * The EDataTypes that map to real TypeScript primitives with a genuine
 * zero-value, mirroring real Java EMF's own primitive/wrapper distinction
 * exactly: EBoolean/EInt/ELong/EFloat/EDouble/EShort/EByte correspond to
 * Java's `boolean`/`int`/`long`/`float`/`double`/`short`/`byte` (never
 * null, always has a real default) - EBooleanObject/EIntegerObject/etc.
 * are the wrapper counterparts (can be null/absent) and are NOT included
 * here. EString is deliberately excluded too: `String` has no primitive
 * counterpart in Java at all, unlike the numeric/boolean types.
 *
 * Only EBoolean/EInt/EFloat/EDouble were named explicitly in the request
 * that added this; ELong/EShort/EByte were added here for consistency
 * with the same underlying Java primitive-vs-wrapper reasoning - flagged
 * as an interpretive extension, not a literal instruction.
 */
const PRIMITIVE_VALUE_DATATYPE_NAMES = new Set(['EBoolean', 'EInt', 'ELong', 'EFloat', 'EDouble', 'EShort', 'EByte']);

export function isPrimitiveValueType(classifier: EClassifier | undefined): boolean {
  return (
    classifier !== undefined && isEDataType(classifier) && PRIMITIVE_VALUE_DATATYPE_NAMES.has(classifier.getName()!)
  );
}

/**
 * The initial value of a stored field of a primitive data type, as TypeScript source: the
 * feature's `defaultValueLiteral` if it has one, else `false` for EBoolean, `0n` for ELong and
 * `0` for the other numeric types.
 *
 * @throws Error if the `defaultValueLiteral` is not a valid value of the type.
 */
export function primitiveDefaultValue(feature: ETypedElement): string {
  const declared =
    'getDefaultValueLiteral' in feature ? (feature as EStructuralFeature).getDefaultValueLiteral()?.trim() : undefined;
  const literal = declared === '' ? undefined : declared;
  const typeName = feature.getEType()?.getName();
  const invalid = () => new Error(`Invalid defaultValueLiteral '${literal}' for feature '${feature.getName()}'.`);
  if (typeName === 'EBoolean') {
    if (literal === undefined) return 'false';
    if (!/^(true|false)$/i.test(literal)) throw invalid();
    return literal.toLowerCase();
  }
  if (typeName === 'ELong') {
    if (literal === undefined) return '0n';
    if (!/^[+-]?\d+$/.test(literal)) throw invalid();
    return `${BigInt(literal)}n`;
  }
  if (literal === undefined) return '0';
  const value = Number(literal);
  if (Number.isNaN(value)) throw invalid();
  return String(value);
}

/**
 * A feature's scalar TypeScript type, with " | undefined" appended UNLESS
 * the type is one of the real JS-primitive-with-a-zero-value EDataTypes
 * (see isPrimitiveValueType) - those never need the union, since a
 * generated field for one always has a real value (the zero-default),
 * never a genuine absence. Prefer this over manually appending
 * " | undefined" to tsScalarType()'s result in a template, so the
 * primitive-type exception lives in one place.
 */
export function tsOptionalScalarType(type: EClassifier | ETypedElement | undefined): string {
  const scalar = tsScalarType(type);
  const classifier = type !== undefined && isTypedElement(type) ? type.getEType() : type;
  if (classifier && isPrimitiveValueType(classifier)) return scalar;
  // `unknown | undefined` is just `unknown` - already includes "unset".
  if (scalar === 'unknown') return scalar;
  return `${scalar} | undefined`;
}

/**
 * "getTitle" or, for a single-valued EBoolean attribute specifically,
 * "isPublished" - matching the common convention (real EMF does this too,
 * gated on the same isMany()===false && type===EBoolean condition).
 * Deliberately does NOT affect many-valued features (an EList<boolean>
 * has no sensible "isX" reading) or the setter (which stays "setX"
 * regardless - only asked for the getter to change).
 */
export function beanGetterName(feature: EStructuralFeature): string {
  const type = feature.getEType();
  if (!feature.isMany() && type && type.getName() === 'EBoolean') {
    return `is${ucfirst(feature.getName()!)}`;
  }
  return `get${ucfirst(feature.getName()!)}`;
}

/** The full TypeScript type for a feature's getter/setter, including EList<T> for many-valued features. */
export function tsFeatureType(feature: ETypedElement): string {
  const scalar = tsScalarType(feature);
  if ('isMany' in feature && (feature as { isMany(): boolean }).isMany()) {
    return `EList<${scalar}>`;
  }
  return scalar;
}

/** Whether a single-valued feature's getter/setter type should be nullable (unset is a real possibility). */
export function isOptional(feature: EStructuralFeature): boolean {
  return !feature.isRequired();
}

export function isEClass(classifier: EClassifier): classifier is EClass {
  return 'getEStructuralFeatures' in classifier;
}

export function isEEnum(classifier: EClassifier): classifier is EEnum {
  return 'getELiterals' in classifier;
}

export function isEDataType(classifier: EClassifier): classifier is EDataType {
  return !isEClass(classifier) && !isEEnum(classifier);
}

export function isEReference(feature: EStructuralFeature): boolean {
  return 'isContainment' in feature;
}

/** "name: Type, name2: Type2" for an operation's parameter list. */
export function paramList(operation: EOperation): string {
  return operation
    .getEParameters()
    .toArray()
    .map((p) => `${p.getName()}: ${tsFeatureType(p)}`)
    .join(', ');
}

/** Like paramList, but every parameter is optional ("name?: type") - for the merged implementation signature of an auto-resolved overload set (see metaclassAccessorCollision). */
export function optionalParamList(operation: EOperation): string {
  return operation
    .getEParameters()
    .toArray()
    .map((p) => `${p.getName()}?: ${tsFeatureType(p)}`)
    .join(', ');
}

/** "name, name2" - just the argument names, e.g. for a super-call passthrough. */
export function argList(operation: EOperation): string {
  return operation
    .getEParameters()
    .toArray()
    .map((p) => p.getName())
    .join(', ');
}

/**
 * Groups a class's own operations by name, preserving first-seen order -
 * needed because real Ecore.ecore has genuine overloaded operations
 * (EEnum.getEEnumLiteral, by name and by value) and a TS class can only
 * have ONE method body per name, unlike an interface, which supports
 * overloads natively (so only the impl side needs this grouping, not the
 * types/ interface side - see the loop in eclass.njk). Scoped to
 * same-arity overloads only, matching what real Ecore.ecore actually
 * has - a genuine arity mismatch within one name is not handled (see
 * NOTES.md).
 */
export function groupOperationsByName(operations: Iterable<EOperation>): EOperation[][] {
  const groups = new Map<string, EOperation[]>();
  for (const op of operations) {
    const list = groups.get(op.getName()!);
    if (list) list.push(op);
    else groups.set(op.getName()!, [op]);
  }
  return [...groups.values()];
}

/** "name" if every name in `names` is identical, otherwise "nameOrValueOrEtc" - used to synthesize a merged parameter name for an overload group. */
function mergeNames(names: string[]): string {
  const unique = [...new Set(names)];
  return (
    unique[0] +
    unique
      .slice(1)
      .map((n) => `Or${ucfirst(n)}`)
      .join('')
  );
}

interface MergedParam {
  name: string;
  type: string;
  /** Present in only some of the overloads - so optional in the implementation signature. */
  optional: boolean;
}

/**
 * The implementation signature's parameters for a group of same-named
 * operations, one per position up to the LONGEST overload: each position's
 * type is the union of every overload's type there (among the overloads
 * that have that position), and its name is synthesized via mergeNames()
 * when they used different names (getEEnumLiteral(name)/getEEnumLiteral(value)
 * merges to "nameOrValue"). A position not every overload has is optional -
 * positions are prefixes, so the required ones always come first.
 */
function mergedParams(group: EOperation[]): MergedParam[] {
  const arity = Math.max(...group.map((op) => op.getEParameters().size()));
  const params: MergedParam[] = [];
  for (let i = 0; i < arity; i++) {
    const having = group.filter((op) => op.getEParameters().size() > i);
    params.push({
      name: mergeNames(having.map((op) => op.getEParameters().get(i)!.getName()!)),
      type: [...new Set(having.map((op) => tsFeatureType(op.getEParameters().get(i)!)))].join(' | '),
      optional: having.length < group.length,
    });
  }
  return params;
}

/**
 * The merged implementation signature's parameter list for a group of
 * same-named operations (see mergedParams; different arities included).
 * For a group of exactly one operation, this is identical to paramList().
 */
export function mergedParamList(group: EOperation[]): string {
  const first = group[0]!;
  if (group.length === 1) return paramList(first);
  return mergedParams(group)
    .map((p) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`)
    .join(', ');
}

export interface OverloadBranch {
  operation: EOperation;
  /** The TypeScript condition that selects this overload. */
  condition: string;
  /** The overload's body (layered, see operationBody), or undefined -> the branch throws its own "no body" error. */
  body: string | undefined;
  /** `const <own name> = <merged name> as <own type>;` for each of the overload's own parameter names its body actually uses. */
  aliases: string[];
  /** e.g. "EClass.getEStructuralFeature(featureID)", for error messages. */
  label: string;
}

export interface OverloadDispatch {
  /** Set when the group is NOT dispatched: the whole implementation is one throwing stub with this message. */
  stubMessage?: string;
  branches: OverloadBranch[];
}

/**
 * Runtime-testable TypeScript primitive: `typeof x === 'string'` and so
 * on. This is knowledge about TypeScript itself, not about any Ecore
 * datatype - what the parameter's resolved TS TEXT is, is still decided by
 * the model. Anything else (a generated interface, a many-valued
 * parameter, a compound type) has no runtime test.
 */
function primitiveTest(name: string, tsText: string): string | undefined {
  return ['string', 'number', 'boolean', 'bigint'].includes(tsText) ? `typeof ${name} === '${tsText}'` : undefined;
}

/**
 * `source` with string literals and comments blanked out, so that finding
 * an identifier in it means USING it: 'by-name:' is not a use of `name`.
 * The expressions inside a template literal's `${...}` are code and are kept.
 */
function codeOnly(source: string): string {
  let out = '';
  let i = 0;
  const n = source.length;
  while (i < n) {
    const c = source[i]!;
    const next = source[i + 1];
    if (c === '/' && next === '/') {
      while (i < n && source[i] !== '\n') i++;
    } else if (c === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
    } else if (c === "'" || c === '"') {
      i++;
      while (i < n && source[i] !== c) i += source[i] === '\\' ? 2 : 1;
      i++;
      out += ' ';
    } else if (c === '`') {
      i++;
      while (i < n && source[i] !== '`') {
        if (source[i] === '\\') i += 2;
        else if (source[i] === '$' && source[i + 1] === '{') {
          let depth = 1;
          i += 2;
          while (i < n && depth > 0) {
            if (source[i] === '{') depth++;
            else if (source[i] === '}') depth--;
            if (depth > 0) out += source[i];
            i++;
          }
          out += ' ';
        } else i++;
      }
      i++;
      out += ' ';
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

const escapeForSingleQuotes = (text: string) => text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/**
 * How the implementation of an overload group selects the overload to
 * run. Per overload, in order:
 *
 *  1. an explicit `dispatch` detail on the overload's annotation with
 *     source https://typemf.dev/generator, used as written (a condition
 *     over the MERGED parameter names) - for cases the derivation cannot
 *     handle;
 *  2. otherwise a condition derived from the parameters, combined with &&,
 *     for each position: a position the overload does not have must be
 *     `=== undefined`; where the overloads having the position differ in
 *     type, the overload's own type must be a runtime-testable primitive
 *     (`typeof x === 'string'`); where the type is the same everywhere but
 *     the position is optional, `!== undefined`.
 *
 * The group is NOT dispatched - the implementation stays a single
 * throwing stub whose message says why - when no overload has a body,
 * when a needed test cannot be derived and no explicit condition was
 * given, or when two overloads end up with the same condition (they could
 * never be told apart, so the second would be unreachable).
 */
export function overloadDispatch(group: EOperation[], className: string): OverloadDispatch {
  const name = group[0]!.getName();
  const stub = (why: string): OverloadDispatch => ({
    branches: [],
    stubMessage: escapeForSingleQuotes(`${className}.${name}() is overloaded and ${why} - nothing to generate.`),
  });

  if (!group.some((op) => operationBody(op) !== undefined))
    return stub('none of its overloads has a `body` annotation');

  const merged = mergedParams(group);
  const branches: OverloadBranch[] = [];

  for (const op of group) {
    const params = [...op.getEParameters()];
    const label = `${className}.${name}(${params.map((p) => p.getName()).join(', ')})`;

    const dispatchDetails = op.getEAnnotation(TYPEMF_GENERATOR_ANNOTATION_SOURCE)?.getDetails();
    let condition = dispatchDetails && detailValue(dispatchDetails, 'dispatch');
    if (condition === undefined || condition === '') {
      const parts: string[] = [];
      for (let i = 0; i < merged.length; i++) {
        const m = merged[i]!;
        const own = params[i];
        if (own === undefined) {
          parts.push(`${m.name} === undefined`);
          continue;
        }
        const havingTypes = new Set(
          group.filter((o) => o.getEParameters().size() > i).map((o) => tsFeatureType(o.getEParameters().get(i)!))
        );
        if (havingTypes.size > 1) {
          const test = 'isMany' in own && own.isMany() ? undefined : primitiveTest(m.name, tsScalarType(own));
          if (test === undefined) {
            return stub(
              `cannot be dispatched: the parameter \`${own.getName()}\` of ${label} has type ${tsFeatureType(own)}, ` +
                'which has no runtime test - add a `dispatch` detail to the overload'
            );
          }
          parts.push(test);
        } else if (m.optional) {
          parts.push(`${m.name} !== undefined`);
        }
      }
      condition = parts.join(' && ');
    }

    const body = operationBody(op);
    const code = body === undefined ? '' : codeOnly(body);
    const aliases =
      body === undefined
        ? []
        : params.flatMap((p, i) => {
            const merged_i = merged[i]!;
            const own = p.getName()!;
            return own !== merged_i.name && new RegExp(`(?<![\\w$])${own.replace(/[$]/g, '\\$')}(?![\\w$])`).test(code)
              ? [`const ${own} = ${merged_i.name} as ${tsFeatureType(p)};`]
              : [];
          });
    branches.push({ operation: op, condition, body, aliases, label });
  }

  const seen = new Map<string, string>();
  for (const b of branches) {
    const earlier = seen.get(b.condition);
    if (earlier !== undefined || b.condition === '') {
      return stub(
        `cannot be dispatched: ${earlier ?? b.label} and ${b.label} have the same dispatch condition ` +
          `(${b.condition === '' ? 'none' : b.condition}), so they cannot be told apart at runtime - add a \`dispatch\` detail`
      );
    }
    seen.set(b.condition, b.label);
  }
  return { branches };
}

/**
 * An operation's return type, with " | undefined" appended only if its
 * OWN declared multiplicity says the result may genuinely be absent
 * (not required - lowerBound < 1) - unlike tsOptionalScalarType() (used
 * for structural features' getters), which appends it unconditionally
 * for every non-primitive type. Operations need this per-operation check
 * instead of a blanket rule: most operations (isSuperTypeOf(): boolean,
 * getClassifierID(): number, ...) are genuinely never-null by their own
 * declared multiplicity, and blanket-appending | undefined to every one
 * of them would be wrong - unlike structural features, where treating
 * every single-valued reference as "may be unset" is the reasonable
 * default.
 *
 * This is the fix for a real, confirmed gap: real Ecore.ecore's own
 * EModelElement.getEAnnotation(source) has no declared lowerBound (real
 * EMF's default there is 0 - not required), meaning the operation is
 * genuinely allowed to return nothing when no annotation with that
 * source is attached - but the generator previously always emitted the
 * bare, non-optional return type for every operation regardless.
 */
export function tsOperationReturnType(op: EOperation): string {
  const scalar = tsScalarType(op);
  if (isPrimitiveValueType(op.getEType())) return scalar;
  if (op.isRequired()) return scalar;
  if (scalar === 'unknown') return scalar; // `unknown | undefined` is just `unknown`
  return `${scalar} | undefined`;
}

/** The merged implementation signature's return type for a group - the union of every overload's OWN (possibly optional) return type via tsOperationReturnType(), deduplicated (so an all-identical group collapses to just that one type, not a redundant self-union). */
export function mergedReturnType(group: EOperation[]): string {
  return [...new Set(group.map((op) => tsOperationReturnType(op)))].join(' | ');
}

/**
 * Uppercases only the first character, leaving the rest untouched -
 * NOT the same as Nunjucks' built-in `capitalize` filter, which mirrors
 * Jinja2's and lowercases everything after the first letter (breaking any
 * camelCase name: "pageCount" -> "Pagecount"). Used to build bean-style
 * accessor names ("pageCount" -> "getPageCount") without corrupting them.
 */
export function ucfirst(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

/** The generated Package singleton class name for a package, e.g. "library" -> "LibraryPackage". */
export function packageClassName(pkg: EPackage): string {
  return `${ucfirst(pkg.getName()!)}Package`;
}

export function factoryClassName(pkg: EPackage): string {
  return `${ucfirst(pkg.getName()!)}Factory`;
}

export function switchClassName(pkg: EPackage): string {
  return `${ucfirst(pkg.getName()!)}Switch`;
}

export function typeGuardsClassName(pkg: EPackage): string {
  return `${ucfirst(pkg.getName()!)}TypeGuards`;
}

/** The EClass's single supertype for TS `extends` purposes, or undefined - see NOTES.md on multiple inheritance. */
export function superType(eClass: EClass): EClass | undefined {
  const supers = eClass.getESuperTypes();
  return supers.size() > 0 ? supers.get(0) : undefined;
}

/** eClass itself, then each ancestor in turn (via superType()), nearest first. */
export function superTypeChain(eClass: EClass): EClass[] {
  const chain: EClass[] = [eClass];
  let current = superType(eClass);
  while (current) {
    chain.push(current);
    current = superType(current);
  }
  return chain;
}

/**
 * Whether `eClass` is EClassifier or a subclass of it, when generating Ecore itself: such a class
 * gets a stored classifier ID (`getClassifierID`/`setClassifierID`), which is bookkeeping, not a
 * modeled feature. Always false for any other package, so a user class that happens to be named
 * EClassifier is generated like any other class.
 */
export function isClassifierDerived(eClass: EClass): boolean {
  return generationContext.generateEcore && superTypeChain(eClass).some((c) => c.getName() === 'EClassifier');
}

/** Like {@link isClassifierDerived}, for EStructuralFeature (feature ID and container class). */
export function isStructuralFeatureDerived(eClass: EClass): boolean {
  return generationContext.generateEcore && superTypeChain(eClass).some((c) => c.getName() === 'EStructuralFeature');
}

/** Like {@link isClassifierDerived}, for EOperation (operation ID). */
export function isOperationDerived(eClass: EClass): boolean {
  return generationContext.generateEcore && superTypeChain(eClass).some((c) => c.getName() === 'EOperation');
}

/**
 * Whether `op` is one of Ecore's own operations that the bookkeeping methods implement
 * (`getClassifierID`, `getFeatureID`, `getOperationID`, `getContainerClass`; see
 * {@link isClassifierDerived}), so the operation loop must not generate it again.
 */
export function isBookkeepingOperation(op: EOperation, eClass: EClass): boolean {
  if (op.getName() === 'getClassifierID' && op.getEParameters().isEmpty() && isClassifierDerived(eClass)) return true;
  if (op.getName() === 'getFeatureID' && op.getEParameters().isEmpty() && isStructuralFeatureDerived(eClass))
    return true;
  if (op.getName() === 'getOperationID' && op.getEParameters().isEmpty() && isOperationDerived(eClass)) return true;
  if (op.getName() === 'getContainerClass' && op.getEParameters().isEmpty() && isStructuralFeatureDerived(eClass))
    return true;
  return false;
}

/**
 * Whether classifier `classifierName`'s zero-arg metaclass accessor
 * (get{ClassifierName}(), generated directly on the package class for
 * every classifier the package declares) collides with a real EOperation
 * inherited by the package class from one of ITS OWN ancestors. Only
 * relevant when self-hosting - "EPackage" (the package class's own
 * superclass) is itself one of the metamodel's declared classifiers only
 * in that case; an ordinary metamodel never has this situation at all,
 * so this always returns undefined for one.
 *
 * General by design, not hardcoded to specific names: real Ecore.ecore
 * happens to have exactly two instances of this shape
 * (EModelElement.getEAnnotation(source), EPackage.getEClassifier(name)),
 * found by a systematic scan across every classifier's own+inherited
 * generated members, not by inspection - confirmed nothing else in the
 * real file collides this way (or any other way) - see NOTES.md. This
 * function exists so the SAME resolution automatically covers any future
 * metamodel with a classifier sharing a name with one of the package
 * class's own inherited operations, without needing another hardcoded
 * exclusion added by hand each time one is found.
 */
export function metaclassAccessorCollision(classifierName: string, pkg: EPackage): EOperation | undefined {
  const ePackageClassifier = [...pkg.getEClassifiers()].find((c) => c.getName() === 'EPackage' && isEClass(c));
  if (!ePackageClassifier) return undefined;
  const accessorName = 'get' + classifierName;
  for (const ancestor of superTypeChain(ePackageClassifier as EClass)) {
    for (const op of ancestor.getEOperations()) {
      if (op.getName() === accessorName) return op;
    }
  }
  return undefined;
}

/**
 * Distinct, non-primitive classifier names referenced by any metaclass-
 * accessor collision's own signature (return type or parameter types) in
 * `pkg` - needed for {Pkg}Package.ts's own import line, general rather
 * than hardcoding "EAnnotation" (real Ecore.ecore's one actual instance
 * today): a future metamodel's own colliding operation could return or
 * accept any classifier at all.
 */
export function metaclassAccessorCollisionTypeNames(pkg: EPackage): string[] {
  const names = new Set<string>();
  const maybeAdd = (type: EClassifier | undefined) => {
    if (type && (isEClass(type) || isEEnum(type))) names.add(type.getName()!);
  };
  for (const classifier of pkg.getEClassifiers()) {
    const collision = metaclassAccessorCollision(classifier.getName()!, pkg);
    if (!collision) continue;
    maybeAdd(collision.getEType());
    for (const param of collision.getEParameters()) maybeAdd(param.getEType());
  }
  return [...names];
}

/**
 * A general validation pass, meant to run during generation (not just as
 * a one-off diagnostic): for every classifier in `pkg`, checks every name
 * that would be generated as one of its members - own or inherited bean
 * accessors, real operations, bookkeeping methods (classifierID/
 * featureID), and (for the package class specifically) metaclass
 * accessors - for a collision with something else generated under the
 * same name, EXCLUDING the two patterns the generator already resolves
 * correctly on its own (isBookkeepingOperation's exclusion, and
 * metaclassAccessorCollision's automatic overload-set generation).
 * Anything left over is a genuine, unhandled collision that would
 * silently produce wrong runtime behaviour (the later declaration wins,
 * no compile error) - generation should refuse to proceed rather than
 * emit it silently.
 *
 * Deliberately reuses the same real helpers the templates themselves
 * use (isBookkeepingOperation, groupOperationsByName, beanGetterName,
 * metaclassAccessorCollision) rather than a parallel reimplementation,
 * so this can never silently drift out of sync with what actually gets
 * generated.
 */
export interface MemberCollision {
  classifierName: string;
  memberName: string;
  sources: string[];
}

/**
 * Every classifier, feature, operation, parameter, and enum literal in `pkg` genuinely needs a name -
 * code generation cannot produce a meaningful `class {name} {}`/`get{name}()`/etc. for one that has
 * none (real Ecore.ecore's own `name` attribute is optional, matching real EMF, so this is a real,
 * reachable state, not a hypothetical one). Checked once, up front, via the same validate() hook every
 * other model-level problem goes through - so every OTHER function in this file can safely assert a
 * name is present (`!`) rather than re-checking it at every one of the many call sites that need one,
 * confident generate() would have already refused to run otherwise.
 */
export function findUnnamedElements(pkg: EPackage): string[] {
  const problems: string[] = [];
  const check = (element: { getName(): string | undefined }, kind: string, where: string): void => {
    if (element.getName() === undefined) problems.push(`${where}: a ${kind} with no name`);
  };
  for (const classifier of pkg.getEClassifiers()) {
    check(classifier, 'classifier', pkg.getName() ?? '(this package)');
    if (isEClass(classifier)) {
      for (const feature of classifier.getEStructuralFeatures())
        check(feature, 'feature', classifier.getName() ?? '(unnamed classifier)');
      for (const op of classifier.getEOperations()) {
        check(op, 'operation', classifier.getName() ?? '(unnamed classifier)');
        for (const param of op.getEParameters())
          check(
            param,
            'parameter',
            `${classifier.getName() ?? '(unnamed classifier)'}.${op.getName() ?? '(unnamed operation)'}`
          );
      }
    } else if (isEEnum(classifier)) {
      for (const literal of classifier.getELiterals())
        check(literal, 'enum literal', classifier.getName() ?? '(unnamed classifier)');
    }
  }
  return problems;
}

export function findUnresolvedCollisions(pkg: EPackage): MemberCollision[] {
  const packageClassifierName = 'EPackage';
  const isSelfHosting = [...pkg.getEClassifiers()].some((c) => c.getName() === packageClassifierName && isEClass(c));
  const classifiers = [...pkg.getEClassifiers()].filter(isEClass);
  const results: MemberCollision[] = [];

  function scan(chainRoot: EClass, label: string, extra: Array<[string, string]>): void {
    const chain = superTypeChain(chainRoot);
    const byName = new Map<string, string[]>();
    const add = (name: string, source: string) => {
      if (!byName.has(name)) byName.set(name, []);
      byName.get(name)!.push(source);
    };

    for (const [name, source] of extra) add(name, source);

    for (const anc of chain) {
      const ancName = anc.getName()!;
      for (const f of anc.getEStructuralFeatures()) {
        add(beanGetterName(f), `${ancName}.${f.getName()} getter`);
        if (!f.isMany()) {
          add('set' + f.getName()![0]!.toUpperCase() + f.getName()!.slice(1), `${ancName}.${f.getName()} setter`);
        }
      }
      for (const group of groupOperationsByName(anc.getEOperations())) {
        const op = group[0]!;
        if (isBookkeepingOperation(op, anc)) continue; // already correctly excluded from generation
        add(op.getName()!, `${ancName}.${op.getName()} operation`);
      }
      if (isClassifierDerived(anc) && ancName === 'EClassifier') {
        add('getClassifierID', `${ancName} bookkeeping`);
        add('setClassifierID', `${ancName} bookkeeping`);
      }
      if (isStructuralFeatureDerived(anc) && ancName === 'EStructuralFeature') {
        add('getFeatureID', `${ancName} bookkeeping`);
        add('setFeatureID', `${ancName} bookkeeping`);
      }
    }

    for (const [name, sources] of byName) {
      if (sources.length > 1) {
        results.push({ classifierName: label, memberName: name, sources });
      }
    }
  }

  for (const c of classifiers) {
    scan(c, c.getName()!, []);
  }

  if (isSelfHosting) {
    // EcorePackage (the synthetic, generated package class) is never
    // itself one of pkg.getEClassifiers() - it extends the real "EPackage"
    // classifier, plus has its own metaclass accessors (one per
    // classifier the package declares), auto-resolved by
    // metaclassAccessorCollision where a real inherited operation exists.
    const ePackageClassifier = classifiers.find((c) => c.getName() === packageClassifierName)!;
    const ownAccessors: Array<[string, string]> = [];
    for (const classifier of pkg.getEClassifiers()) {
      if (metaclassAccessorCollision(classifier.getName()!, pkg)) continue; // already auto-resolved
      ownAccessors.push(['get' + classifier.getName(), `EcorePackage.get${classifier.getName()} metaclass accessor`]);
    }
    scan(ePackageClassifier, 'EcorePackage', ownAccessors);
  }

  return results;
}

/**
 * Distinct EClass/EEnum type names referenced by `features` (an EClass or
 * EEnum's own attribute/reference types) that need their own import
 * statement - EDataType primitives (string/number/boolean/Date) never do.
 * A TS helper rather than a Nunjucks loop with manual dedup, since
 * template-level array mutation is awkward without extra Nunjucks
 * extensions - matches the "templates handle structure, TS computes"
 * principle.
 */
export function referencedApiTypes(features: Iterable<EStructuralFeature>, ...excludeTypeNames: string[]): string[] {
  const exclude = new Set(excludeTypeNames);
  const names = new Set<string>();
  for (const feature of features) {
    const type = feature.getEType();
    if (type && (isEReference(feature) || isEEnum(type)) && !exclude.has(type.getName()!)) names.add(type.getName()!);
    // Classes/enums bound inside type arguments need importing too.
    for (const argument of genericArgumentClassifiers(feature.getEGenericType())) {
      if ((isEClass(argument) || isEEnum(argument)) && !exclude.has(argument.getName()!))
        names.add(argument.getName()!);
    }
  }
  return [...names];
}

/**
 * The operation-scoped analog of referencedApiTypes, for the identical
 * "needs its own import statement" reason - but operations weren't
 * scanned by anything at all before this existed, a genuine gap: an
 * operation's return type or any parameter's type can be any classifier,
 * including a non-primitive EDataType (real Ecore.ecore's own
 * EClassifier.getContainerClass(): EJavaClass, for one) - unlike
 * features, where only EClass/EEnum ever need an import (a plain
 * EDataType-typed feature is always one of the handful of TS-primitive-
 * mapped names). Confirmed as a real, previously-missing import by
 * actually generating real Ecore.ecore and type-checking the merged
 * output, not assumed - see NOTES.md.
 */
export function referencedOperationTypes(operations: Iterable<EOperation>, ...excludeTypeNames: string[]): string[] {
  const exclude = new Set(excludeTypeNames);
  const names = new Set<string>();
  const maybeAdd = (type: EClassifier | undefined) => {
    if (type && (isEClass(type) || isEEnum(type)) && !exclude.has(type.getName()!)) {
      names.add(type.getName()!);
    }
  };
  for (const op of operations) {
    maybeAdd(op.getEType());
    for (const argument of genericArgumentClassifiers(op.getEGenericType())) maybeAdd(argument);
    for (const param of op.getEParameters()) {
      maybeAdd(param.getEType());
      for (const argument of genericArgumentClassifiers(param.getEGenericType())) maybeAdd(argument);
    }
  }
  return [...names];
}

/**
 * Nunjucks 3.2.4 silently does not support Jinja2's inline `{% for x in y
 * if cond %}` for-loop filter syntax (it parses without error but produces
 * wrong output - verified empirically, not assumed) - these pre-filtered
 * helpers replace every case a template would otherwise want that syntax
 * for, consistent with keeping templates dumb.
 */
/**
 * Safely emits a metamodel-supplied string as a TypeScript string literal,
 * via JSON.stringify() - handles quotes, apostrophes, newlines, backslashes,
 * anything. Every place a template interpolates a name/label/annotation
 * value from the metamodel into generated source needs this, not naive
 * single-quote wrapping - annotation `details` values in particular are
 * often free-form prose (GenModel documentation, validation constraint
 * text) and are genuinely likely to contain apostrophes or multi-line
 * text, which naive interpolation would turn into broken generated code.
 */
export function jsString(value: string | undefined): string {
  if (value === undefined) {
    throw new Error(
      'jsString() received undefined - this means required metamodel data (a name, nsURI, nsPrefix, or ' +
        'annotation value) is missing on the source EPackage. JSON.stringify(undefined) is not a string, so ' +
        'this would otherwise silently emit an empty/malformed argument into generated code rather than ' +
        'failing clearly at generation time.'
    );
  }
  return JSON.stringify(value);
}

/**
 * Nunjucks' {% for %} reliably iterates plain objects and arrays, but not
 * necessarily a real ES6 Map instance the same way (its object-iteration
 * path likely uses Object.keys(), which is empty for a Map's own
 * enumerable properties - the entries live internally, not as own
 * properties). Converting to a plain array here avoids relying on
 * behavior that was never actually verified.
 */
/** Whether one of `features` is many-valued and stored in a list (has no custom getter). */
export function hasStoredManyValuedFeature(features: Iterable<EStructuralFeature>): boolean {
  return [...features].some((feature) => feature.isMany() && featureGetter(feature) === undefined);
}

/**
 * `element`'s annotations that belong in the runtime metamodel. EMF's GenModel annotations are
 * left out, and so are the generator's own (sources starting with https://typemf.dev/generator),
 * which only steer code generation - except on a data type, where they say which TypeScript type
 * the data type maps to and what to import, which generating another package that uses the data
 * type reads from this runtime metamodel.
 */
export function runtimeAnnotations(element: EModelElement): EAnnotation[] {
  return element
    .getEAnnotations()
    .toArray()
    .filter((annotation) => {
      const source = annotation.getSource() ?? '';
      if (source === ECLIPSE_GENMODEL_ANNOTATION_SOURCE) return false;
      return !source.startsWith(TYPEMF_GENERATOR_ANNOTATION_SOURCE) || isDataTypeObject(element);
    });
}

export function detailsEntries(annotation: EAnnotation): { key: string; value: string }[] {
  return [...annotation.getDetails()].map((entry) => ({ key: entry.getKey() ?? '', value: entry.getValue() ?? '' }));
}

export function eClassesOf(pkg: EPackage): EClass[] {
  return pkg
    .getEClassifiers()
    .toArray()
    .filter((c): c is EClass => isEClass(c) && c.getName() !== 'EObject');
}

export function concreteEClassesOf(pkg: EPackage): EClass[] {
  return eClassesOf(pkg).filter((c) => !c.isAbstract());
}

/**
 * Finds an EClass by exact name within the package, or undefined if none
 * matches - used specifically for the EFactory/{Pkg}Factory unification
 * special case (see efactory.njk): when a metamodel models a classifier
 * literally named "EFactory" (as real Ecore.ecore does), the package-level
 * generated Factory extends ITS generated impl instead of the generic
 * @typemf/core EFactoryImpl base, matching real EMF's own
 * EcoreFactoryImpl-extends-EFactoryImpl design. Ordinary metamodels (no
 * "EFactory" classifier) are unaffected.
 */
export function findEClassByName(pkg: EPackage, name: string): EClass | undefined {
  return eClassesOf(pkg).find((c) => c.getName() === name);
}

export function singleValuedFeatures(features: Iterable<EStructuralFeature>): EStructuralFeature[] {
  return [...features].filter((f) => !f.isMany());
}
