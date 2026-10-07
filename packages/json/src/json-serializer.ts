import {
  computeFragment,
  convertToString,
  createFromString,
  createInstanceOf,
  EClass,
  EObject,
  EPackageRegistry,
  EReference,
  EStructuralFeature,
  createProxy,
  getProxyURI,
  isEDataType,
  resolveFragment,
  Resource,
  type EObjectSerializer,
  URI,
} from '@typemf/core';
import { EClassRef, eClassToRef, refToEClass } from './eclass-ref.js';
import { NamespaceTable } from './namespace-table.js';

interface TypemfJsonDocument {
  $namespaces?: Record<string, string>;
  $roots: Record<string, unknown>[];
}

interface RefJson {
  $ref: string;
  $eClass?: EClassRef;
}

/**
 * The wire format, in brief (see the design discussion for the full
 * rationale): a document-level $namespaces prefix table; $eClass on every
 * object as {namespace, name} rather than a repeated full nsURI; EEnum
 * attribute values as their literal, which is also their in-memory value;
 * containment features nest inline; non-containment
 * references become { $ref, $eClass? }, where $ref is:
 *   - "#fullId"           same-resource, by ID attribute
 *   - "#/0/books/2"        same-resource, positional (JSON Pointer-shaped)
 *   - "<uri>#<either form>" cross-resource - becomes an unresolved proxy
 * and the optional $eClass on a $ref is only present when the target's
 * actual EClass differs from the feature's statically declared type
 * (mirrors XMI's xsi:type, which is likewise only emitted when needed).
 */
export class JsonSerializer implements EObjectSerializer {
  async serialize(roots: EObject[], resource: Resource): Promise<Uint8Array> {
    const namespaces = new NamespaceTable();
    const rootJson = roots.map((root) => serializeObject(root, roots, resource, namespaces));
    const doc: TypemfJsonDocument = { $namespaces: namespaces.toJSON(), $roots: rootJson };
    return new TextEncoder().encode(JSON.stringify(doc, null, 2));
  }

  /**
   * $namespaces IS the document's declared-namespace table by construction - the writer only
   * ever adds an entry when a real $eClass reference actually needs it (see NamespaceTable), so
   * unlike XMI's xmlns (which can accumulate stray, unused declarations on a hand-edited file),
   * this is already exactly the "declared" set with no further scanning needed.
   */
  async peekReferencedNsURIs(content: Uint8Array): Promise<string[]> {
    const text = new TextDecoder().decode(content);
    const doc = JSON.parse(text) as TypemfJsonDocument;
    return Object.values(doc.$namespaces ?? {});
  }

  async deserialize(content: Uint8Array, resource: Resource): Promise<EObject[]> {
    const text = new TextDecoder().decode(content);
    let doc: TypemfJsonDocument;
    try {
      doc = JSON.parse(text) as TypemfJsonDocument;
    } catch (e) {
      // A structurally wrong document is reported as an error instead of throwing a raw
      // TypeError/SyntaxError that aborts the whole load with no context.
      resource.getErrors().push({
        message: `'${resource.getURI().toString()}' is not valid JSON: ${(e as Error).message}`,
      });
      return [];
    }
    if (doc === null || typeof doc !== 'object' || !Array.isArray(doc.$roots)) {
      resource.getErrors().push({
        message: `'${resource.getURI().toString()}' is not a valid @typemf/json document - missing or malformed '$roots' array.`,
      });
      return [];
    }
    const namespaces = new NamespaceTable(doc.$namespaces);

    const packageRegistry = resource.getResourceSet()?.getPackageRegistry();
    if (!packageRegistry) {
      throw new Error(
        `Cannot deserialize '${resource.getURI().toString()}': its Resource has no ResourceSet, which is ` +
          'needed to look up EPackages by namespace. Create it via ResourceSet.createResource()/getResource(), ' +
          'not the ResourceImpl constructor directly.'
      );
    }

    const ctx: DeserializeContext = {
      namespaces,
      packageRegistry,
      pendingRefs: [],
      resource,
    };

    const roots: EObject[] = [];
    for (const rootJson of doc.$roots) {
      roots.push(constructObject(rootJson, roots, ctx));
    }
    for (const wire of ctx.pendingRefs) wire();

    return roots;
  }
}

// ---------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------

function serializeObject(
  obj: EObject,
  roots: EObject[],
  sourceResource: Resource,
  namespaces: NamespaceTable
): Record<string, unknown> {
  const eClass = obj.eClass();
  const json: Record<string, unknown> = { $eClass: eClassToRef(eClass, namespaces) };

  for (const feature of eClass.getEAllStructuralFeatures()) {
    if (!obj.eIsSet(feature)) continue;
    const name = feature.getName();
    if (name === undefined) continue; // no name to give it as a JSON key - skip, don't fail the whole object

    if (!isReferenceFeature(feature)) {
      json[name] = feature.isMany()
        ? [...(obj.eGet(feature) as Iterable<unknown>)].map((v) => encodeAttributeValue(v, feature))
        : encodeAttributeValue(obj.eGet(feature), feature);
      continue;
    }

    json[name] = feature.isMany()
      ? [...(obj.eGet(feature) as Iterable<EObject>)].map((v) =>
          serializeReferenceValue(v, feature, roots, sourceResource, namespaces)
        )
      : serializeReferenceValue(obj.eGet(feature) as EObject, feature, roots, sourceResource, namespaces);
  }

  return json;
}

function serializeReferenceValue(
  target: EObject,
  feature: EReference,
  roots: EObject[],
  sourceResource: Resource,
  namespaces: NamespaceTable
): unknown {
  if (feature.isContainment()) {
    return serializeObject(target, roots, sourceResource, namespaces);
  }

  if (target.eIsProxy()) {
    // Round-trip an already-unresolved proxy without loading it, relative to this document.
    const proxyURI = getProxyURI(target);
    if (!proxyURI) {
      throw new Error(`eIsProxy() is true but no proxy URI is on record for this ${target.eClass().getName()}.`);
    }
    return buildRefJson(proxyURI.deresolve(sourceResource.getURI()).toString(), target.eClass(), feature, namespaces);
  }

  const targetResource = target.eResource();
  const isLocal = !targetResource || targetResource === sourceResource;

  const fragment = fragmentForTarget(target, targetResource, roots);
  // Another document is written relative to this one where possible, as EMF does.
  const refString = isLocal
    ? `#${fragment}`
    : `${targetResource!.getURI().deresolve(sourceResource.getURI()).toString()}#${fragment}`;

  return buildRefJson(refString, target.eClass(), feature, namespaces);
}

/**
 * Defers to whichever resource actually owns `target` for how its
 * fragment should be written - its own serializer's computeFragment()
 * when it provides one, @typemf/core's default otherwise. This is what
 * lets a JSON document correctly reference an object living in an XMI
 * document (or vice versa): the TARGET's format decides its own fragment
 * grammar, not the format doing the referencing. When `target` isn't
 * attached to any resource yet (a newly created object never saved
 * anywhere), falls back to computeFragment() against `fallbackRoots` -
 * the same behaviour as before this dispatch existed.
 */
function fragmentForTarget(target: EObject, owningResource: Resource | undefined, fallbackRoots: EObject[]): string {
  if (!owningResource) return computeFragment(target, fallbackRoots);
  const roots = owningResource.getContents().toArray();
  const serializer = owningResource.getSerializer();
  return serializer.computeFragment ? serializer.computeFragment(target, roots) : computeFragment(target, roots);
}

function buildRefJson(
  refString: string,
  actualEClass: EClass,
  feature: EReference,
  namespaces: NamespaceTable
): RefJson {
  const declaredEClass = feature.getEType() as EClass | undefined;
  const json: RefJson = { $ref: refString };
  if (declaredEClass !== actualEClass) {
    json.$eClass = eClassToRef(actualEClass, namespaces);
  }
  return json;
}

/**
 * "#" is never included here - callers prepend it. Fragment computation
 * itself is delegated per-target via fragmentForTarget() above, not called
 * directly here, so a reference into a differently-formatted resource
 * (e.g. an @typemf/xmi document) gets that format's own grammar rather
 * than always assuming @typemf/core's default.
 */

function isReferenceFeature(feature: EStructuralFeature): feature is EReference {
  return 'isContainment' in feature;
}

/**
 * The JSON form of an attribute value: strings, booleans and finite numbers as they are, every
 * other value (a `bigint`, a `Date`, a byte array, ...) as the string the data type's factory
 * converts it to.
 */
export function encodeAttributeValue(value: unknown, feature: EStructuralFeature): unknown {
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const eType = feature.getEType();
  return eType && isEDataType(eType) ? convertToString(eType, value) : value;
}

// ---------------------------------------------------------------------
// Deserialization
// ---------------------------------------------------------------------

interface DeserializeContext {
  namespaces: NamespaceTable;
  packageRegistry: EPackageRegistry;
  /** Reference-wiring deferred until every object in the document has been constructed. */
  pendingRefs: Array<() => void>;
  /** Where to record a problem instead of throwing and aborting the whole load: an
   *  unknown key is a warning (data loss on the next save); an unresolved reference is an error
   *  (the feature is left unset, the rest of the document still loads). */
  resource: Resource;
}

function constructObject(json: Record<string, unknown>, roots: EObject[], ctx: DeserializeContext): EObject {
  const eClass = refToEClass(json.$eClass as EClassRef, ctx.namespaces, ctx.packageRegistry);
  const obj = createInstanceOf(eClass);

  const knownNames = new Set(
    eClass
      .getEAllStructuralFeatures()
      .toArray()
      .map((f) => f.getName())
  );
  for (const key of Object.keys(json)) {
    if (key === '$eClass') continue;
    if (!knownNames.has(key)) {
      ctx.resource.getWarnings().push({
        message: `Unknown key '${key}' on an instance of '${eClass.getName()}' - not a feature of this class. It will be lost if this document is saved again.`,
      });
    }
  }

  for (const feature of eClass.getEAllStructuralFeatures()) {
    const name = feature.getName();
    if (name === undefined || !(name in json)) continue;
    const raw = json[name];

    if (!isReferenceFeature(feature)) {
      try {
        if (feature.isMany()) {
          const list = obj.eGet(feature) as { add(v: unknown): void };
          for (const v of raw as unknown[]) list.add(decodeAttributeValue(v, feature));
        } else {
          obj.eSet(feature, decodeAttributeValue(raw, feature));
        }
      } catch (err) {
        ctx.resource.getErrors().push({
          message: `Invalid value for '${name}' on an instance of '${eClass.getName()}': ${(err as Error).message}`,
        });
      }
      continue;
    }

    if (!feature.isContainment()) {
      // Deferred to phase 2: the target may not be constructed yet
      // (same-resource forward references are legal regardless of
      // document order), and cross-resource targets are never loaded
      // eagerly here at all.
      ctx.pendingRefs.push(() => wireReference(obj, feature, raw, roots, ctx));
      continue;
    }

    if (feature.isMany()) {
      const list = obj.eGet(feature) as { add(v: EObject): void };
      for (const childJson of raw as Record<string, unknown>[]) {
        list.add(constructObject(childJson, roots, ctx));
      }
    } else {
      obj.eSet(feature, constructObject(raw as Record<string, unknown>, roots, ctx));
    }
  }

  return obj;
}

function wireReference(
  obj: EObject,
  feature: EReference,
  raw: unknown,
  roots: EObject[],
  ctx: DeserializeContext
): void {
  if (feature.isMany()) {
    const list = obj.eGet(feature) as { add(v: EObject): void };
    for (const refJson of raw as RefJson[]) {
      const resolved = resolveRef(refJson, feature, roots, ctx);
      if (resolved) list.add(resolved);
    }
  } else {
    const resolved = resolveRef(raw as RefJson, feature, roots, ctx);
    if (resolved) obj.eSet(feature, resolved);
  }
}

function resolveRef(
  refJson: RefJson,
  feature: EReference,
  roots: EObject[],
  ctx: DeserializeContext
): EObject | undefined {
  const refString = refJson.$ref;
  const declaredEClass = feature.getEType() as EClass;
  const overrideEClass = refJson.$eClass
    ? refToEClass(refJson.$eClass, ctx.namespaces, ctx.packageRegistry)
    : undefined;

  if (refString.startsWith('#')) {
    // Same-resource: resolveFragment() from @typemf/core handles both the
    // ID-attribute form ("Book_Dune") and the positional form
    // ("/0/books/2") - the same function ResourceSet.resolve() uses for
    // the cross-resource case, so both stay in sync by construction.
    const fragment = refString.slice(1);
    const found = resolveFragment(fragment, roots);
    if (!found) {
      // Recorded as an error rather than thrown, so the rest of the document still
      // loads (as @typemf/xmi does) - the feature is left unset for this value.
      ctx.resource.getErrors().push({
        message: `Unresolved reference '${refString}' on feature '${feature.getName()}': no object matches this fragment in this document.`,
      });
      return undefined;
    }
    return found;
  }

  // Cross-resource: never loaded eagerly - a proxy, resolved later via
  // ResourceSet.resolve() (which uses the identical resolveFragment()). A
  // relative reference is relative to this document.
  const uri = URI.parse(refString).resolve(ctx.resource.getURI());
  return createProxy(overrideEClass ?? declaredEClass, uri);
}

/**
 * The attribute value a JSON string, number or boolean stands for, converted with the factory of
 * the attribute's data type.
 *
 * @throws Error if the value is not a valid value of the data type.
 */
export function decodeAttributeValue(value: unknown, feature: EStructuralFeature): unknown {
  const eType = feature.getEType();
  if (!eType || !isEDataType(eType)) return value;
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') return value;
  return createFromString(eType, String(value));
}
