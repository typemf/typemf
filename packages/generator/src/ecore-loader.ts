import { EPackage, ResourceSetImpl, URI } from '@typemf/core';
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
 * bootstrapping story and why this two-step shape is necessary (our
 * hand-written EClassImpl/etc don't support eSet(), so the reader can
 * never populate them directly).
 */
export async function loadEcorePackage(ecoreFilePath: string): Promise<EPackage> {
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
