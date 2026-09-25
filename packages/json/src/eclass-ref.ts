import { EClass, EPackageRegistry } from '@typemf/core';
import { NamespaceTable } from './namespace-table.js';

export interface EClassRef {
  namespace: string;
  name: string;
}

export function eClassToRef(eClass: EClass, namespaces: NamespaceTable): EClassRef {
  const pkg = eClass.getEPackage();
  if (!pkg) {
    throw new Error(`EClass '${eClass.getName()}' has no owning EPackage - cannot serialize instances of it.`);
  }
  return { namespace: namespaces.prefixFor(pkg), name: eClass.getName() };
}

export function refToEClass(ref: EClassRef, namespaces: NamespaceTable, packageRegistry: EPackageRegistry): EClass {
  const nsURI = namespaces.resolve(ref.namespace);
  if (!nsURI) {
    throw new Error(`Unknown namespace prefix '${ref.namespace}' - not declared in this document's $namespaces.`);
  }
  const pkg = packageRegistry.getPackage(nsURI);
  if (!pkg) {
    throw new Error(`No EPackage registered for nsURI '${nsURI}' (prefix '${ref.namespace}').`);
  }
  const classifier = pkg.getEClassifier(ref.name);
  if (!classifier) {
    throw new Error(`Package '${nsURI}' has no classifier named '${ref.name}'.`);
  }
  return classifier as EClass;
}
