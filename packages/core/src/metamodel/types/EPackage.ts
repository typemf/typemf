import { EClassifier } from './EClassifier.js';
import { EFactory } from './EFactory.js';
import { EList } from './EList.js';
import { ENamedElement } from './ENamedElement.js';

/** A namespace of classifiers, identified by its namespace URI. */
export interface EPackage extends ENamedElement {
  /** The namespace URI that identifies the package in documents and package registries. */
  getNsURI(): string | undefined;
  setNsURI(value: string | undefined): void;
  /** The XML namespace prefix used for the package in XMI documents. */
  getNsPrefix(): string | undefined;
  setNsPrefix(value: string | undefined): void;
  /** The factory that creates instances of the package's classes. */
  getEFactoryInstance(): EFactory | undefined;
  setEFactoryInstance(value: EFactory | undefined): void;
  /** The classifiers of this package, not including those of subpackages. */
  getEClassifiers(): EList<EClassifier>;
  /** The packages nested in this one. */
  getESubpackages(): EList<EPackage>;
  /** The package this one is nested in, if any. */
  getESuperPackage(): EPackage | undefined;
  /** The classifier named `name` in this package, not searching subpackages, if any. */
  getEClassifier(name: string): EClassifier | undefined;
}
