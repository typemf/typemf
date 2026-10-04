import { Resource, ResourceFactory, ResourceFactoryRegistry, ResourceImpl, URI } from '@typemf/core';
import { XmiSerializer } from './xmi-serializer.js';

export class XmiResourceFactory implements ResourceFactory {
  createResource(uri: URI): Resource {
    return new ResourceImpl(uri, new XmiSerializer());
  }
}

/**
 * Registers for both "xmi" and "ecore" - a .ecore file is itself an
 * ordinary XMI instance document (its root just happens to be an
 * EPackage), read by this exact same XmiSerializer with no separate
 * parsing logic. Interpreting one correctly still requires a meta-schema
 * (a real, registered EPackage describing what "EClass"/"EAttribute"/etc.
 * mean) to already be in the EPackageRegistry before parsing - see
 * @typemf/core's ecore/ for that piece, and NOTES.md for the full
 * bootstrapping story.
 */
export function registerXmiFormat(registry: ResourceFactoryRegistry): void {
  registry.registerForExtension('xmi', new XmiResourceFactory());
  registry.registerForExtension('ecore', new XmiResourceFactory());
}
