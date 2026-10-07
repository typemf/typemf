import {
  EClassifier,
  EcorePackageImpl,
  EObject,
  EPackage,
  getProxyURI,
  isEReference,
  Resource,
  ResourceSet,
  ResourceSetImpl,
  URI,
} from '@typemf/core';
import { NodeFileUriConverter } from '@typemf/node';
import { registerXmiFormat } from '@typemf/xmi';
import { convertDynamicEcoreToTyped } from './ecore-dynamic-to-typed.js';
import { buildEcoreMetaSchema } from './ecore-meta-schema.js';

/**
 * Loads a real .ecore file into a typed EPackage. A .ecore file is an
 * ordinary XMI instance document whose root happens to be an EPackage -
 * read here by @typemf/xmi's own generic XmiSerializer, with no separate
 * parsing logic of its own. Interpreting it correctly needs a registered
 * meta-schema describing what "EClass"/"EAttribute"/etc mean (see
 * ecore-meta-schema.ts) - this produces a DYNAMIC EObject graph, which
 * gets converted (see ecore-dynamic-to-typed.ts) into the real, typed
 * EPackage generate() actually needs as input. See NOTES.md for the full
 * bootstrapping story and why this two-step shape is necessary - NOT
 * because hand-written classes lack eSet() support (they support it fully
 * for every real, modeled feature now, confirmed directly), but because
 * bookkeeping fields (classifierID, featureID, containerClass,
 * operationID) are deliberately excluded from eSet() by design, matching
 * real EMF, and generate()'s own internals need those set too (via plain
 * methods and id-assignment.ts, not eSet) - so a pure eSet-driven read
 * could never be sufficient on its own regardless.
 */
export async function loadEcorePackage(ecoreFilePath: string): Promise<EPackage> {
  // Post-swap, every @typemf/core setter (setName() included) routes through getEcorePackageRef(),
  // which needs Ecore's own metaclass system bootstrapped first - this triggers that safely, once,
  // right here (the single earliest entry point), before buildEcoreMetaSchema() OR
  // convertDynamicEcoreToTyped() construct a single typed metaclass instance. See NOTES.md's point
  // 6/7 write-ups.
  void EcorePackageImpl.eINSTANCE;
  const resourceSet = new ResourceSetImpl();
  resourceSet.getUriConverterRegistry().register(new NodeFileUriConverter());
  registerXmiFormat(resourceSet.getResourceFactoryRegistry());

  const metaSchema = buildEcoreMetaSchema();
  resourceSet.getPackageRegistry().register(metaSchema.pkg);

  const uri = URI.createFileURI(ecoreFilePath);
  const resource = await resourceSet.getResource(uri, true);
  if (!resource) {
    throw new Error(`Could not load '${ecoreFilePath}'.`);
  }
  return convertResource(resource, resourceSet, new Map(), []);
}

/**
 * Converts the package at the root of `resource`. Every other .ecore file it references is loaded
 * and converted first, so references into it become that package's typed classifiers. Cyclic
 * references between files are not supported.
 */
async function convertResource(
  resource: Resource,
  resourceSet: ResourceSet,
  converted: Map<Resource, EPackage>,
  inProgress: Resource[]
): Promise<EPackage> {
  const done = converted.get(resource);
  if (done) return done;
  const location = resource.getURI().toString();
  if (inProgress.includes(resource)) {
    const cycle = [...inProgress, resource].map((r) => r.getURI().toString()).join(' -> ');
    throw new Error(`Cyclic references between .ecore files are not supported: ${cycle}`);
  }

  const dynamicPkg = resource.getContents().toArray()[0];
  if (!dynamicPkg) {
    throw new Error(`'${location}' has no root element - expected a single EPackage.`);
  }

  const foreign = new Map<EObject, EClassifier>();
  for (const proxy of foreignProxies(dynamicPkg)) {
    const target = await resourceSet.resolve(proxy).catch((err: unknown) => {
      throw new Error(
        `Cannot resolve the classifier reference '${getProxyURI(proxy)?.toString()}': ${(err as Error).message}`,
        { cause: err }
      );
    });
    const targetResource = target.eResource();
    const targetPkg = targetResource
      ? await convertResource(targetResource, resourceSet, converted, [...inProgress, resource])
      : undefined;
    const name = target.eClass().getEStructuralFeature('name');
    const classifier = name && targetPkg?.getEClassifier(target.eGet(name) as string);
    if (!classifier) {
      throw new Error(
        `Cannot resolve the classifier reference '${getProxyURI(proxy)?.toString()}': only classifiers of a referenced package's root are supported.`
      );
    }
    foreign.set(proxy, classifier);
  }

  const pkg = convertDynamicEcoreToTyped(dynamicPkg, (proxy) => foreign.get(proxy));
  converted.set(resource, pkg);
  return pkg;
}

/** The unresolved references of `root` and its contents that point into another file, not into Ecore. */
function foreignProxies(root: EObject): Set<EObject> {
  const ecoreNsURI = EcorePackageImpl.eINSTANCE.getNsURI();
  const proxies = new Set<EObject>();
  for (const obj of [root, ...root.eAllContents()]) {
    for (const feature of obj.eClass().getEAllStructuralFeatures()) {
      if (!isEReference(feature) || feature.isContainment()) continue;
      const value = obj.eGet(feature);
      const values = feature.isMany() ? [...(value as Iterable<EObject>)] : value ? [value as EObject] : [];
      for (const v of values) {
        if (v.eIsProxy() && getProxyURI(v)?.trimFragment().toString() !== ecoreNsURI) proxies.add(v);
      }
    }
  }
  return proxies;
}
