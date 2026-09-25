import {
  EClass,
  EClassifier,
  EDataType,
  EEnum,
  EModelElement,
  EOperation,
  EPackage,
  EStructuralFeature,
  ETypedElement,
} from '@typemf/core';

const GENMODEL_ANNOTATION_SOURCE = 'http://www.eclipse.org/emf/2002/GenModel';

/** Real EMF's own convention for embedded doc comments in a .ecore file - see NOTES.md. */
export function documentationOf(element: EModelElement): string | undefined {
  return element.getEAnnotation(GENMODEL_ANNOTATION_SOURCE)?.getDetails().get('documentation');
}

/** Renders a JSDoc block from documentationOf(), or '' if there is none. */
export function docComment(element: EModelElement, indent = ''): string {
  const doc = documentationOf(element);
  if (!doc) return '';
  const lines = doc.trim().split('\n');
  if (lines.length === 1) {
    return `${indent}/** ${lines[0]} */\n`;
  }
  const body = lines.map((line) => `${indent} * ${line}`).join('\n');
  return `${indent}/**\n${body}\n${indent} */\n`;
}

/**
 * Our own operation-body annotation - deliberately NOT real EMF's "body"
 * key (source http://www.eclipse.org/emf/2002/GenModel, details.body):
 * that key's value is unambiguous Java source in real EMF because EMF only
 * ever generates one language. We support multiple simultaneous template
 * sets, so a bare shared "body" key would be ambiguous (or actively wrong,
 * if a real EMF-authored .ecore happens to carry Java in it) - the key is
 * scoped per target template set instead. See NOTES.md for the full
 * reasoning.
 */
const TYPEMF_GENERATOR_ANNOTATION_SOURCE = 'https://typemf.dev/generator';

export function operationBody(operation: EOperation, templateSetName: string): string | undefined {
  const value = operation.getEAnnotation(TYPEMF_GENERATOR_ANNOTATION_SOURCE)?.getDetails().get(`body:${templateSetName}`);
  return value && value.length > 0 ? value : undefined;
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
};

/** The real formula body for a trivially-computable derived feature, or undefined if `feature` isn't one of the four. */
export function trivialDerivedFormula(feature: EStructuralFeature): string | undefined {
  if (!feature.isDerived()) return undefined;
  return TRIVIAL_DERIVED_FORMULAS[feature.getName()];
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
export function tsScalarType(classifier: EClassifier | undefined): string {
  if (!classifier) return 'EObject';
  if (isEDataType(classifier)) return tsPrimitiveType(classifier);
  // EClass or EEnum: the generated api-layer type shares the classifier's own name.
  return classifier.getName();
}

function tsPrimitiveType(dataType: EDataType): string {
  switch (dataType.getName()) {
    case 'EString':
      return 'string';
    case 'EInt':
    case 'ELong':
    case 'EDouble':
    case 'EFloat':
      return 'number';
    case 'EBoolean':
      return 'boolean';
    case 'EDate':
      return 'Date';
    default:
      // An unrecognized/custom EDataType: fall back to its own name as a
      // nominal type, same convention generated EClass/EEnum types use.
      return dataType.getName();
  }
}

/** The full TypeScript type for a feature's getter/setter, including EList<T> for many-valued features. */
export function tsFeatureType(feature: ETypedElement): string {
  const scalar = tsScalarType(feature.getEType());
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

/** "name, name2" - just the argument names, e.g. for a super-call passthrough. */
export function argList(operation: EOperation): string {
  return operation
    .getEParameters()
    .toArray()
    .map((p) => p.getName())
    .join(', ');
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
  return `${ucfirst(pkg.getName())}Package`;
}

export function factoryClassName(pkg: EPackage): string {
  return `${ucfirst(pkg.getName())}Factory`;
}

export function switchClassName(pkg: EPackage): string {
  return `${ucfirst(pkg.getName())}Switch`;
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
    if (!type) continue;
    if (isEReference(feature) || isEEnum(type)) {
      if (!exclude.has(type.getName())) names.add(type.getName());
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
export function detailsEntries(annotation: { getDetails(): Map<string, string> }): { key: string; value: string }[] {
  return [...annotation.getDetails().entries()].map(([key, value]) => ({ key, value }));
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
