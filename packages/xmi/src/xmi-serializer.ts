import {
  EClass,
  EcorePackageImpl,
  EObject,
  EPackageRegistry,
  EReference,
  EStructuralFeature,
  isEClassifier,
  Resource,
  URI,
  computeFragment as coreComputeFragment,
  createProxy,
  getProxyURI,
  getResourceOf,
  type EObjectSerializer,
} from '@typemf/core';
import { allStructuralFeaturesOf, computeEmfFragment, resolveEmfFragment } from './emf-fragment.js';
import { NamespaceCollector } from './namespace-collector.js';
import { escapeAttributeValue, escapeText } from './xml-text.js';
import { parseXmlDocument } from './xml-dom.js';

const XMI_NS = 'http://www.omg.org/XMI';
const XSI_NS = 'http://www.w3.org/2001/XMLSchema-instance';

/**
 * Targets real EMF's actual default XMI conventions (verified against
 * documented Java EMF behaviour, not assumed) so files this produces open
 * in real Eclipse-based tooling and vice versa:
 *
 *   - a reference (any cardinality) becomes an XML ATTRIBUTE when its
 *     target is in the SAME document, and a nested <feature href="..."/>
 *     CHILD ELEMENT when the target is in a DIFFERENT document - the
 *     dispatch is by document locality, not by containment or cardinality
 *   - fragments follow EMF's real default grammar: "//@books.2" (single
 *     root, positional), "/" (single root, target is the root itself),
 *     or the bare ID-attribute value when the EClass has one - see
 *     emf-fragment.ts
 *   - polymorphism on a cross-document reference: xsi:type on the href
 *     child element
 *   - polymorphism on a same-document reference: NOTES.md flags this as
 *     a best-effort reconstruction, not independently verified against a
 *     real Eclipse-produced file - see there before relying on it for
 *     interop specifically in the polymorphic + same-document + intra-doc
 *     case
 *
 * v1 scope: single-root documents only (see NOTES.md for the multi-root
 * <xmi:XMI> wrapper form, not yet implemented). Many-valued EAttributes
 * are written as repeated child elements - also flagged in NOTES.md as a
 * judgment call, not verified against EMF's own default for that specific
 * case.
 */
export class XmiSerializer implements EObjectSerializer {
  computeFragment(target: EObject, roots: EObject[]): string {
    return computeEmfFragment(target, roots);
  }

  resolveFragment(fragment: string, roots: EObject[]): EObject | undefined {
    return resolveEmfFragment(fragment, roots);
  }

  async serialize(roots: EObject[], resource: Resource): Promise<Uint8Array> {
    if (roots.length !== 1) {
      throw new Error(
        `XmiSerializer currently only supports exactly one root object (got ${roots.length}) - ` +
          'multi-root documents need the <xmi:XMI> wrapper form, not yet implemented. See NOTES.md.'
      );
    }
    const root = roots[0]!;
    const namespaces = new NamespaceCollector();
    const rootPrefix = namespaces.prefixFor(requirePackage(root.eClass()));
    const parts = writeObjectParts(root, `${rootPrefix}:${root.eClass().getName()}`, roots, resource, namespaces);

    const nsAttrs: Array<[string, string]> = [
      ['xmlns:xmi', XMI_NS],
      ['xmlns:xsi', XSI_NS],
      ...namespaces.entries().map(([prefix, uri]): [string, string] => [`xmlns:${prefix}`, uri]),
    ];
    // xsi:schemaLocation="<nsURI> <path>" for the root's own package, when that package was
    // itself loaded from a real, known file (getResourceOf - the same utility
    // encodeReferenceValue's own "is this local" check relies on) distinct from the document
    // being saved here - a dynamically-loaded .ecore file, the common case this project's own
    // "New Model Instance" dynamic mode produces. Matches the real, standard XMI/XSD convention
    // (confirmed directly against Eclipse's own output for the same scenario) that lets the
    // document be reopened later and point straight back at its own metamodel's real location,
    // without that package needing to be separately, globally registered first. Root's own
    // package only, not every package anything in the document happens to reference -
    // NamespaceCollector itself tracks prefixes and URIs, not the real EPackage objects behind
    // them, and the root's own package is what the real, reported gap was actually about.
    const schemaLocationAttrs: Array<[string, string]> = [];
    const rootPackage = requirePackage(root.eClass());
    const rootPackageResource = getResourceOf(rootPackage);
    if (rootPackageResource && rootPackageResource !== resource) {
      const location = relativeOrAbsolutePath(resource.getURI(), rootPackageResource.getURI());
      schemaLocationAttrs.push(['xsi:schemaLocation', `${rootPackage.getNsURI()} ${location}`]);
    }
    const allAttrs: Array<[string, string]> = [
      ['xmi:version', '2.0'],
      ...nsAttrs,
      ...schemaLocationAttrs,
      ...parts.attributes,
    ];
    const attrStr = allAttrs.map(([k, v]) => ` ${k}="${escapeAttributeValue(v)}"`).join('');
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      (parts.childrenXml
        ? `<${parts.tagName}${attrStr}>${parts.childrenXml}</${parts.tagName}>`
        : `<${parts.tagName}${attrStr}/>`);

    return new TextEncoder().encode(xml);
  }

  /**
   * Root-element only (not a full-tree walk), all declared xmlns:* values (not filtered to ones
   * some xsi:type actually uses) - the simpler of the two real tradeoffs this method has for XMI,
   * chosen deliberately: this project's own writer always declares every namespace a document
   * needs on the root element (see NamespaceCollector/the ['xmlns:xmi', ...] block above), so this
   * is exactly correct for anything this project produces. A third-party or hand-edited XMI file
   * that declares a namespace deeper in the tree (legal XML, just non-standard practice for this
   * kind of document) would have that namespace missed here - an accepted, documented limitation,
   * not an oversight.
   */
  async peekReferencedNsURIs(content: Uint8Array): Promise<string[]> {
    const text = new TextDecoder().decode(content);
    const doc = await parseXmlDocument(text);
    const root = doc.documentElement;
    if (!root) return [];

    const nsURIs: string[] = [];
    for (const attr of Array.from(root.attributes)) {
      if (!attr.name.startsWith('xmlns:')) continue;
      if (attr.value === XMI_NS || attr.value === XSI_NS) continue;
      nsURIs.push(attr.value);
    }
    return nsURIs;
  }

  async deserialize(content: Uint8Array, resource: Resource): Promise<EObject[]> {
    const text = new TextDecoder().decode(content);
    const doc = await parseXmlDocument(text);
    const root = doc.documentElement;
    if (!root) {
      throw new Error(`'${resource.getURI().toString()}' has no document element - not a valid XML document.`);
    }

    const packageRegistry = resource.getResourceSet()?.getPackageRegistry();
    if (!packageRegistry) {
      throw new Error(
        `Cannot deserialize '${resource.getURI().toString()}': its Resource has no ResourceSet, which is ` +
          'needed to look up EPackages by namespace URI.'
      );
    }

    const ctx: DeserializeContext = { packageRegistry };
    const elementToObj = new Map<Element, EObject>();

    // Pass 1: construct every object in the document (via its own
    // containment structure - classifiers, features, operations,
    // parameters, annotations, ... - recursively) and set only its
    // "name" (when its EClass has one), wiring each into its parent's
    // containment feature immediately. This establishes the complete
    // object graph and its full name/position-addressable structure
    // before anything tries to resolve a same-document reference.
    //
    // Pass 2 (completeObject, below) then re-walks the same tree - using
    // elementToObj to find the shell pass 1 already built for each
    // element, rather than constructing a new one - and fills in every
    // remaining attribute and reference.
    //
    // Necessary because real, externally-authored .ecore files contain
    // genuine FORWARD same-document references - e.g. real Ecore.ecore's
    // own "EAttribute" (declared first) has eSuperTypes="#//EStructuralFeature"
    // (declared much later) - and resolving references inline, during
    // the same single pass that constructs objects, fails outright for
    // any such forward reference: the target simply doesn't exist yet.
    // Confirmed directly against the real file, not assumed - see
    // NOTES.md. A prior version deferred only same-document REFERENCES
    // via a pendingRefs callback queue, resolved once after the (single)
    // construction pass finished - but that doesn't help here, since the
    // reference target's shell doesn't exist during pass 1 at all in
    // that design; pass 1 here exists specifically to guarantee it does.
    const rootEClass = resolveElementEClass(root, packageRegistry);
    const rootObj = constructShell(root, rootEClass, ctx, elementToObj);
    const roots = [rootObj];

    completeObject(root, rootObj, ctx, elementToObj, roots);

    return roots;
  }
}

// ---------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------

interface ElementParts {
  tagName: string;
  attributes: Array<[string, string]>;
  childrenXml: string;
}

function writeObjectParts(
  obj: EObject,
  tagName: string,
  roots: EObject[],
  sourceResource: Resource,
  namespaces: NamespaceCollector
): ElementParts {
  const attributes: Array<[string, string]> = [];
  let childrenXml = '';

  for (const feature of obj.eClass().getEAllStructuralFeatures()) {
    // A derived/transient feature (e.g. EClass.eAllGenericSuperTypes, EAttribute.eAttributeType)
    // is, by definition, recomputed from other, real data - never independently persisted, real
    // EMF's own convention too. A real, confirmed bug found via direct reproduction against
    // Ecore.ecore itself (not specific to any one file): without this check, a derived reference
    // feature could get serialized as if it were real, stored data, and since its value may not
    // even be part of this document's own containment tree at all (e.g. a synthesized fallback
    // like EJavaObject), computeFragment/encodeReferenceValue would then fail outright, unable to
    // address something that was never meant to be written out in the first place.
    if (feature.isDerived() || feature.isTransient()) continue;
    if (!obj.eIsSet(feature)) continue;

    if (!isReferenceFeature(feature)) {
      if (feature.isMany()) {
        for (const value of obj.eGet(feature) as Iterable<unknown>) {
          childrenXml += `<${feature.getName()}>${escapeText(encodeAttributeValue(value, feature))}</${feature.getName()}>`;
        }
      } else {
        attributes.push([feature.getName() as string, encodeAttributeValue(obj.eGet(feature), feature)]);
      }
      continue;
    }

    const refFeature = feature as EReference;
    const values = refFeature.isMany() ? [...(obj.eGet(feature) as Iterable<EObject>)] : [obj.eGet(feature) as EObject];

    if (refFeature.isContainment()) {
      for (const child of values) {
        const childTag = childElementTag(child, refFeature, namespaces);
        const childParts = writeObjectParts(child, feature.getName() as string, roots, sourceResource, namespaces);
        const attrs = childTag.xsiType
          ? [['xsi:type', childTag.xsiType], ...childParts.attributes]
          : childParts.attributes;
        childrenXml += renderElement({
          tagName: childParts.tagName,
          attributes: attrs as Array<[string, string]>,
          childrenXml: childParts.childrenXml,
        });
      }
      continue;
    }

    // Non-containment: same-document -> attribute; cross-document -> child element(s).
    const encoded = values.map((v) => encodeReferenceValue(v, refFeature, roots, sourceResource, namespaces));
    const anyCrossDocument = encoded.some((e) => e.crossDocument);
    if (anyCrossDocument) {
      for (const e of encoded) {
        const attrs: Array<[string, string]> = [['href', e.value]];
        if (e.xsiType) attrs.unshift(['xsi:type', e.xsiType]);
        childrenXml += renderElement({ tagName: feature.getName() as string, attributes: attrs, childrenXml: '' });
      }
    } else {
      const anyPolymorphic = encoded.some((e) => e.xsiType);
      const tokens = encoded.map((e) =>
        anyPolymorphic ? `${e.xsiType ?? sameTypeToken(refFeature, namespaces)} ${e.value}` : e.value
      );
      attributes.push([feature.getName() as string, tokens.join(' ')]);
    }
  }

  return { tagName, attributes, childrenXml };
}

function renderElement(parts: ElementParts): string {
  const attrStr = parts.attributes.map(([k, v]) => ` ${k}="${escapeAttributeValue(v)}"`).join('');
  return parts.childrenXml
    ? `<${parts.tagName}${attrStr}>${parts.childrenXml}</${parts.tagName}>`
    : `<${parts.tagName}${attrStr}/>`;
}

function childElementTag(child: EObject, feature: EReference, namespaces: NamespaceCollector): { xsiType?: string } {
  const declared = feature.getEType() as EClass | undefined;
  const actual = child.eClass();
  if (declared === actual) return {};
  const prefix = namespaces.prefixFor(requirePackage(actual));
  return { xsiType: `${prefix}:${actual.getName()}` };
}

function sameTypeToken(feature: EReference, namespaces: NamespaceCollector): string {
  const declared = feature.getEType() as EClass;
  const prefix = namespaces.prefixFor(requirePackage(declared));
  return `${prefix}:${declared.getName()}`;
}

interface EncodedReference {
  value: string;
  crossDocument: boolean;
  xsiType?: string;
}

function encodeReferenceValue(
  target: EObject,
  feature: EReference,
  roots: EObject[],
  sourceResource: Resource,
  namespaces: NamespaceCollector
): EncodedReference {
  const declared = feature.getEType() as EClass | undefined;

  if (target.eIsProxy()) {
    const actual = target.eClass();
    const xsiType =
      declared !== actual ? `${namespaces.prefixFor(requirePackage(actual))}:${actual.getName()}` : undefined;
    const proxyURI = getProxyURI(target);
    if (!proxyURI) {
      throw new Error(`eIsProxy() is true but no proxy URI is on record for this ${actual.getName()}.`);
    }
    return { value: proxyURI.toString(), crossDocument: true, xsiType };
  }

  const targetResource = getResourceOf(target);
  const actual = target.eClass();
  const xsiType =
    declared !== actual ? `${namespaces.prefixFor(requirePackage(actual))}:${actual.getName()}` : undefined;

  // Genuine reachability from THIS document's own roots, not merely "has no resource of its own"
  // - a real, confirmed bug found via direct reproduction against Ecore.ecore itself: the old
  // check (`!targetResource || ...`) treated "not attached to any resource" as automatically
  // local, which is wrong for something like EcorePackage's own EJavaObject - a real, stable,
  // well-known classifier, always available, but never loaded via any real Resource.load() (it's
  // part of the self-hosted, in-memory EcorePackageImpl.eINSTANCE), so getResourceOf() correctly
  // (if misleadingly, for this purpose) returns undefined for it. Walking eContainer() against
  // `roots` directly, rather than trusting resource identity, is what actually decides this.
  if (isReachableFromRoots(target, roots)) {
    return { value: fragmentForTarget(target, targetResource, roots), crossDocument: false, xsiType };
  }

  // Not reachable from this document at all - but if it's part of Ecore's own, always-available
  // metamodel, it's addressed the same way real EMF addresses it: a cross-document reference
  // into Ecore's own real nsURI, with a name-based (not positional) fragment, since Ecore's own
  // classifiers/features are referenced by name in every real .ecore file, never by index.
  const ecoreOwnPath = ecoreOwnFragmentPath(target);
  if (ecoreOwnPath !== undefined) {
    return { value: `${EcorePackageImpl.eINSTANCE.getNsURI()}#${ecoreOwnPath}`, crossDocument: true, xsiType };
  }

  if (targetResource) {
    return {
      value: `${targetResource.getURI().toString()}#${fragmentForTarget(target, targetResource, roots)}`,
      crossDocument: true,
      xsiType,
    };
  }

  // Genuinely unreachable, not part of Ecore's own metamodel, and not attached to any other real
  // resource either - a real, separate problem (e.g. an object created but never actually
  // attached anywhere), kept as a clear, thrown error rather than silently papered over.
  throw new Error(
    `Cannot encode a reference to an object of class '${actual.getName()}': it has no resource of its own, is not part of Ecore's own metamodel, and is not reachable from this document's own roots via containment.`
  );
}

/** Whether `target`'s own eContainer() chain reaches one of `roots` - the real, governing
 *  question "same-document fragment" needs answered, not resource identity. */
function isReachableFromRoots(target: EObject, roots: EObject[]): boolean {
  let current: EObject | undefined = target;
  while (current) {
    if (roots.includes(current)) return true;
    current = current.eContainer();
  }
  return false;
}

/**
 * The real EMF-style name-based path to `target` within Ecore's own, always-available metamodel
 * (e.g. "//EJavaObject", "//EAttribute/eAttributeType") - undefined if target isn't part of it at
 * all.
 *
 * Deliberately type-aware (checking getEPackage()/getEContainingClass(), not eContainer()) - a
 * real, confirmed gap found via direct reproduction: eContainer() is never actually wired up for
 * bootstrap-constructed Ecore objects at all (confirmed directly: EJavaObject.eContainer() is
 * undefined, not EcorePackageImpl.eINSTANCE, even though EJavaObject.getEPackage() correctly
 * returns it) - eBootstrapList()'s whole point is constructing the self-hosted metamodel without
 * the normal containment-wiring overhead eDidAdd() would otherwise do, so walking eContainer() to
 * discover "is this Ecore's own" can never work for it. getEPackage() (on a classifier) and
 * getEContainingClass() (on a feature/operation) are explicitly-set fields instead, set directly
 * during bootstrap regardless of containment wiring - the same reason a much earlier gap in this
 * project ("EClassifier.getEPackage() returns undefined after loading") had to be fixed by
 * setting that field directly rather than deriving it from eContainer().
 */
function ecoreOwnFragmentPath(target: EObject): string | undefined {
  const ecore = EcorePackageImpl.eINSTANCE;

  if (isEClassifier(target)) {
    return target.getEPackage() === ecore ? `//${target.getName() ?? ''}` : undefined;
  }

  const containingClass = hasContainingClass(target) ? target.getEContainingClass() : undefined;
  if (containingClass && containingClass.getEPackage() === ecore && isNamed(target)) {
    return `//${containingClass.getName() ?? ''}/${target.getName() ?? ''}`;
  }
  return undefined;
}

function hasContainingClass(obj: EObject): obj is EObject & { getEContainingClass(): EClass | undefined } {
  return typeof (obj as { getEContainingClass?: unknown }).getEContainingClass === 'function';
}

function isNamed(obj: EObject): obj is EObject & { getName(): string | undefined } {
  return typeof (obj as { getName?: unknown }).getName === 'function';
}

/**
 * Defers to whichever resource actually owns `target` for how its
 * fragment should be written - the same dispatch @typemf/json's writer
 * uses, deliberately not shared code between the two packages. The
 * fallback when the owning resource's serializer doesn't override
 * computeFragment() is @typemf/core's own DEFAULT grammar, not this
 * package's EMF grammar - a plain (non-overriding) target format, like
 * @typemf/json, means "I use core's default", so writing anything else
 * there would produce a fragment its own reader can't resolve. XMI's own
 * grammar is used only as the fallback for the (unusual) case where
 * `target` isn't attached to any resource at all yet.
 */
function fragmentForTarget(target: EObject, owningResource: Resource | undefined, fallbackRoots: EObject[]): string {
  if (!owningResource) return computeEmfFragment(target, fallbackRoots);
  const roots = owningResource.getContents().toArray();
  const serializer = owningResource.getSerializer();
  return serializer.computeFragment ? serializer.computeFragment(target, roots) : coreComputeFragment(target, roots);
}

function isReferenceFeature(feature: EStructuralFeature): feature is EReference {
  return 'isContainment' in feature;
}

function requirePackage(eClass: EClass) {
  const pkg = eClass.getEPackage();
  if (!pkg) throw new Error(`EClass '${eClass.getName()}' has no owning EPackage - cannot serialize instances of it.`);
  return pkg;
}

/**
 * EDate -> ISO string (XML has no native date type). EEnum -> literal
 * name, matching the same convention @typemf/json established (an EEnum
 * attribute's in-memory value already IS its literal's name). Every other
 * primitive is already a string/number/boolean's natural toString().
 */
function encodeAttributeValue(value: unknown, feature: EStructuralFeature): string {
  const eType = feature.getEType();
  if (eType?.getName() === 'EDate' && value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

// ---------------------------------------------------------------------
// Deserialization
// ---------------------------------------------------------------------

interface DeserializeContext {
  packageRegistry: EPackageRegistry;
}

function resolveElementEClass(element: Element, packageRegistry: EPackageRegistry): EClass {
  const xsiType = element.getAttributeNS(XSI_NS, 'type');
  if (xsiType) {
    return resolvePrefixedName(xsiType, element, packageRegistry);
  }
  const nsURI = element.namespaceURI;
  if (!nsURI) {
    throw new Error(`Element <${element.tagName}> has no namespace - cannot determine its EPackage.`);
  }
  const pkg = packageRegistry.getPackage(nsURI);
  if (!pkg) {
    throw new Error(`No EPackage registered for namespace '${nsURI}' (element <${element.tagName}>).`);
  }
  const classifier = pkg.getEClassifier(element.localName);
  if (!classifier) {
    throw new Error(`Package '${nsURI}' has no classifier named '${element.localName}'.`);
  }
  return classifier as EClass;
}

/**
 * A containment child element's EClass, WITHOUT requiring that element to
 * have a namespace of its own. Feature-name-tagged elements (<books>,
 * <cover>, ...) are matched against the parent EClass's structural
 * features by plain local-name string comparison, not namespace lookup -
 * that's how real EMF resolves them too (only classifier-identifying
 * elements/attributes - the document root, an xsi:type value - are ever
 * namespace-qualified). The declared feature type is correct in the
 * overwhelmingly common (non-polymorphic) case; xsi:type on the child
 * element, when present, overrides it - and xsi:type's own value CAN
 * still be resolved via the child element's in-scope namespace bindings
 * even though the element itself has no namespace, since prefix lookup
 * walks the ancestor chain regardless.
 */
function resolveContainmentChildEClass(element: Element, declared: EClass, packageRegistry: EPackageRegistry): EClass {
  const xsiType = element.getAttributeNS(XSI_NS, 'type');
  if (xsiType) return resolvePrefixedName(xsiType, element, packageRegistry);
  return declared;
}

/** Resolves a "prefix:Name" token (from xsi:type or a same-document typed-reference token) via the element's own in-scope namespace bindings. */
function resolvePrefixedName(token: string, contextElement: Element, packageRegistry: EPackageRegistry): EClass {
  const [prefix, name] = token.includes(':') ? token.split(':') : [undefined, token];
  const nsURI = prefix ? contextElement.lookupNamespaceURI(prefix) : contextElement.namespaceURI;
  if (!nsURI) {
    throw new Error(`Could not resolve namespace prefix '${prefix ?? '<default>'}' for type token '${token}'.`);
  }
  const pkg = packageRegistry.getPackage(nsURI);
  if (!pkg) {
    throw new Error(`No EPackage registered for namespace '${nsURI}' (type token '${token}').`);
  }
  const classifier = pkg.getEClassifier(name!);
  if (!classifier) {
    throw new Error(`Package '${nsURI}' has no classifier named '${name}'.`);
  }
  return classifier as EClass;
}

/**
 * Pass 1. Constructs an object for `element`, sets only its "name"
 * feature (when its EClass has one and the element has a "name" XML
 * attribute), records it in `elementToObj` for pass 2 to find again, and
 * recurses into every CONTAINMENT child - wiring each into this object's
 * containment feature immediately, so the full tree (not just this one
 * object) is name/position-navigable by the time pass 1 as a whole
 * finishes. Deliberately does not touch any other attribute or
 * non-containment reference - completeObject does that, in pass 2, once
 * every object in the document is guaranteed to already exist.
 *
 * Only "name" specifically, not a general "ID attribute" lookup
 * (EClass.getEIDAttribute(), which requires isID()) - confirmed by
 * reading resolveEmfFragment's own name-based path (walkNamedSegments /
 * findNamedChild in emf-fragment.ts): it matches by literally looking up
 * a feature named "name" and comparing its value, regardless of whether
 * that feature happens to be marked isID() - real Ecore.ecore's own
 * ENamedElement.name is not marked iD="true" at all, yet "#//EClassName"
 * fragments throughout the file depend on exactly this lookup succeeding.
 */
function constructShell(
  element: Element,
  eClass: EClass,
  ctx: DeserializeContext,
  elementToObj: Map<Element, EObject>
): EObject {
  const obj = eClass.getEPackage()?.getEFactoryInstance()?.create(eClass);
  if (!obj) throw new Error('Could not create object');
  elementToObj.set(element, obj);

  // Two different fragment-resolution paths need two different early
  // fields set, confirmed by actually running the existing test suite
  // against this, not assumed:
  //  - real Ecore.ecore's own "#//ClassName" fragments resolve via
  //    walkNamedSegments/findNamedChild (emf-fragment.ts), which matches
  //    literally on a feature named "name" - regardless of isID().
  //  - an arbitrary user metamodel's bare-token ID fragments (e.g.
  //    "Dune") resolve via findByIdValueIn, which matches on whichever
  //    attribute IS marked isID() - which need not be named "name" at
  //    all (the sample metamodel's own ID attribute is "title").
  // Both need to already hold their real value before any reference to
  // this object is resolved, so pass 1 sets both here, whichever exist.
  const nameFeature = allStructuralFeaturesOf(eClass)
    .filter((f) => f.getName() === 'name')
    .at(0);
  if (nameFeature) {
    const nameAttrValue = element.getAttribute('name');
    if (nameAttrValue !== null) {
      obj.eSet(nameFeature, decodeAttributeValue(nameAttrValue, nameFeature));
    }
  }
  const idFeature = eClass.getEIDAttribute();
  const idFeatureName = idFeature?.getName();
  if (idFeature && idFeatureName && idFeature !== nameFeature) {
    const idAttrValue = element.getAttribute(idFeatureName);
    if (idAttrValue !== null) {
      obj.eSet(idFeature, decodeAttributeValue(idAttrValue, idFeature));
    }
  }

  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes.item(i);
    if (!node || node.nodeType !== 1 /* ELEMENT_NODE */) continue;
    const child = node as unknown as Element;

    const feature = allStructuralFeaturesOf(eClass)
      .filter((feature) => feature.getName() === child.localName)
      .at(0);
    if (!feature || !isReferenceFeature(feature)) continue; // many-valued attribute or unrecognized: completeObject's job
    const refFeature = feature as EReference;
    if (!refFeature.isContainment()) continue; // cross-document href reference: completeObject's job

    const declaredEClass = refFeature.getEType() as EClass;
    const childEClass = resolveContainmentChildEClass(child, declaredEClass, ctx.packageRegistry);
    const childObj = constructShell(child, childEClass, ctx, elementToObj);
    if (feature.isMany()) {
      const list = obj.eGet(feature) as { add(v: EObject): void };
      list.add(childObj);
    } else {
      obj.eSet(feature, childObj);
    }
  }

  return obj;
}

/**
 * Pass 2. Fills in every attribute and reference `constructShell` (pass
 * 1) deliberately left untouched, for the object it already built for
 * `element` (looked up via `elementToObj`, or `obj` directly for the
 * element currently being completed - never constructs anything new).
 * Same-document references now resolve unconditionally inline: by the
 * time this pass runs at all, pass 1 has already finished for the WHOLE
 * document, so every possible reference target - forward or backward -
 * already exists and is already wired into the containment tree.
 */
function completeObject(
  element: Element,
  obj: EObject,
  ctx: DeserializeContext,
  elementToObj: Map<Element, EObject>,
  roots: EObject[]
): void {
  const eClass = obj.eClass();

  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes.item(i)!;
    if (attr.namespaceURI === XMI_NS || attr.namespaceURI === XSI_NS) continue;
    if (attr.name.startsWith('xmlns')) continue;

    const feature = allStructuralFeaturesOf(eClass)
      .filter((feature) => feature.getName() === attr.localName)
      .at(0);
    if (!feature) continue;

    if (!isReferenceFeature(feature)) {
      if (feature.isMany()) {
        // Many-valued attributes are written as child elements (see the
        // class doc comment) - an attribute-form value here would be an
        // externally-authored file using a different convention; not
        // supported in v1.
        continue;
      }
      obj.eSet(feature, decodeAttributeValue(attr.value, feature));
      continue;
    }

    // Reference(s) written as an attribute regardless of cardinality - same-document fragments
    // (most attribute-form references) resolved immediately, since every possible same-document
    // target already exists by this point; a same-attribute cross-document reference to another
    // document entirely (see decodeAttributeFormReference's own reasoning) constructed as a proxy
    // instead, exactly like the href-child-element case just below.
    const refFeature = feature as EReference;
    const resolved = decodeAttributeFormReference(attr.value, refFeature, element, roots, ctx.packageRegistry);
    if (refFeature.isMany()) {
      const list = obj.eGet(refFeature) as { add(v: EObject): void };
      for (const r of resolved) list.add(r);
    } else {
      obj.eSet(refFeature, resolved[0]);
    }
  }

  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes.item(i);
    if (!node || node.nodeType !== 1 /* ELEMENT_NODE */) continue;
    const child = node as unknown as Element;

    const feature = allStructuralFeaturesOf(eClass)
      .filter((feature) => feature.getName() === child.localName)
      .at(0);
    if (!feature) continue;

    if (!isReferenceFeature(feature)) {
      // Many-valued attribute, written as a repeated child element.
      const value = decodeAttributeValue(child.textContent ?? '', feature);
      if (feature.isMany()) {
        const list = obj.eGet(feature) as { add(v: unknown): void };
        list.add(value);
      } else {
        obj.eSet(feature, value);
      }
      continue;
    }

    const refFeature = feature as EReference;
    if (refFeature.isContainment()) {
      // Already constructed and wired onto obj by pass 1 - just recurse
      // to fill in ITS attributes/references too.
      const childObj = elementToObj.get(child);
      if (!childObj) {
        throw new Error(
          `Internal error: no shell was constructed for <${child.tagName}> during pass 1 - ` +
            'constructShell and completeObject have diverged on which children count as containment.'
        );
      }
      completeObject(child, childObj, ctx, elementToObj, roots);
      continue;
    }

    // Cross-document reference, written as a <feature href="..."/> child element.
    const href = child.getAttribute('href');
    if (!href) {
      throw new Error(`<${child.tagName}> under <${element.tagName}> is a non-containment reference but has no href.`);
    }
    const xsiType = child.getAttributeNS(XSI_NS, 'type');
    const declared = refFeature.getEType() as EClass;
    const proxyEClass = xsiType ? resolvePrefixedName(xsiType, child, ctx.packageRegistry) : declared;
    const proxy = createProxy(proxyEClass, URI.parse(href));
    if (feature.isMany()) {
      const list = obj.eGet(feature) as { add(v: EObject): void };
      list.add(proxy);
    } else {
      obj.eSet(feature, proxy);
    }
  }
}

/**
 * A reference written as an XML attribute - same-document fragments (the common case) and
 * cross-document references into an entirely different document both use this same attribute
 * form in real EMF-authored XMI (a <feature href="..."/> child element, the other form this
 * serializer writes, is only one of the two conventions actually in use - see writeObjectParts's
 * own "anyPolymorphic" attribute-form path, which already produces both from this side; this was
 * the read-side gap that had never been exercised until parsing a real, externally-authored file).
 * Each whitespace-separated fragment is classified independently: one that parses as an absolute
 * URI (a real scheme, e.g. "http://www.eclipse.org/emf/2002/Ecore#//EString") is cross-document,
 * resolved as a proxy exactly like the href-child-element case; anything else is a
 * same-document fragment, resolved immediately via resolveEmfFragment, since every possible
 * same-document target already exists by this point.
 */
function decodeAttributeFormReference(
  rawValue: string,
  feature: EReference,
  contextElement: Element,
  roots: EObject[],
  packageRegistry: EPackageRegistry
): EObject[] {
  const tokens = rawValue.split(/\s+/).filter((t) => t.length > 0);
  const paired =
    tokens.length > 0 &&
    tokens.length % 2 === 0 &&
    tokens.every((t, i) => (i % 2 === 0 ? looksLikeTypeToken(t) : true));

  const pairs: Array<{ typeToken: string | undefined; fragment: string }> = paired
    ? tokens.filter((_, i) => i % 2 === 1).map((fragment, i) => ({ typeToken: tokens[i * 2], fragment }))
    : tokens.map((fragment) => ({ typeToken: undefined, fragment }));

  return pairs.map(({ typeToken, fragment }) => {
    if (isAbsoluteUri(fragment)) {
      const declared = feature.getEType() as EClass;
      const proxyEClass = typeToken ? resolvePrefixedName(typeToken, contextElement, packageRegistry) : declared;
      return createProxy(proxyEClass, URI.parse(fragment));
    }

    // Real EMF-authored files always write same-document attribute-form
    // references with a leading "#" (e.g. eType="#//EString") - our own
    // writer never produces one (computeEmfFragment's own output has no
    // "#"), so this was never exercised by our own round-trip tests until
    // parsing a real external file. Strip it here, at the point raw XML
    // attribute text becomes a fragment to resolve, rather than teaching
    // every fragment-parsing branch to tolerate an optional prefix.
    const normalized = fragment.startsWith('#') ? fragment.slice(1) : fragment;
    const resolved = resolveEmfFragment(normalized, roots);
    if (!resolved) {
      throw new Error(
        `Unresolved same-document reference '${fragment}' on feature '${feature.getName()}': ` +
          'no object matches this fragment in this document.'
      );
    }
    return resolved;
  });
}

/**
 * A relative path from `fromUri` to `toUri` when both share a scheme (the common, same-workspace
 * case this is actually for), else `toUri`'s own full string form as a safe fallback - a portable,
 * hand-rolled computation (segment-by-segment common-prefix comparison, "../" for each remaining
 * `from` segment) rather than importing node:path, since this package is deliberately environment-
 * agnostic, not Node-specific.
 */
function relativeOrAbsolutePath(fromUri: URI, toUri: URI): string {
  if (fromUri.getScheme() !== toUri.getScheme()) return toUri.toString();

  const fromSegments = fromUri
    .getPath()
    .split('/')
    .filter((s) => s.length > 0);
  const toSegments = toUri
    .getPath()
    .split('/')
    .filter((s) => s.length > 0);
  // The `to` file's own name is never a shared "directory" segment to compare away - compared
  // against `from`'s own containing directory only.
  const fromDir = fromSegments.slice(0, -1);
  const toDir = toSegments.slice(0, -1);
  const toFile = toSegments[toSegments.length - 1] ?? '';

  let commonLength = 0;
  while (
    commonLength < fromDir.length &&
    commonLength < toDir.length &&
    fromDir[commonLength] === toDir[commonLength]
  ) {
    commonLength++;
  }

  const upSegments = fromDir.slice(commonLength).map(() => '..');
  const downSegments = toDir.slice(commonLength);
  const relativeSegments = [...upSegments, ...downSegments, toFile];
  return relativeSegments.join('/');
}

function looksLikeTypeToken(token: string): boolean {
  return token.includes(':') && !token.startsWith('/') && !token.startsWith('#');
}

/** A real scheme prefix immediately followed by "//" or "#" (e.g. "http://...",
 *  "platform:/resource/...#//Foo") - the unambiguous signal of an absolute URI, never produced by
 *  a same-document fragment (computeEmfFragment's own output starts with "/" or a digit, never a
 *  scheme) or a prefixed type token like "ecore:EDataType" (never followed by "//" or "#"). */
function isAbsoluteUri(token: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:(\/\/|#)/.test(token);
}

function decodeAttributeValue(value: string, feature: EStructuralFeature): unknown {
  const eType = feature.getEType();
  const typeName = eType?.getName();
  if (typeName === 'EDate') return new Date(value);
  if (typeName === 'EInt' || typeName === 'ELong' || typeName === 'EDouble' || typeName === 'EFloat')
    return Number(value);
  if (typeName === 'EBoolean') return value === 'true';
  return value;
}
