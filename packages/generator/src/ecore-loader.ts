import { EcorePackageImpl, EPackage, ResourceSetImpl, URI } from '@typemf/core';
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

  const roots = resource.getContents().toArray();
  const dynamicPkg = roots[0];
  if (!dynamicPkg) {
    throw new Error(`'${ecoreFilePath}' has no root element - expected a single EPackage.`);
  }

  return convertDynamicEcoreToTyped(dynamicPkg);
}
