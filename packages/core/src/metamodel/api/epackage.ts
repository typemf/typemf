import { EClassifier } from './eclassifier.js';
import { EFactory } from './efactory.js';
import { EList } from './elist.js';
import { ENamedElement } from './enamed-element.js';

/** A namespace of classifiers - the unit a metamodel is defined and serialized in. */
export interface EPackage extends ENamedElement {
  /** The namespace URI that globally identifies this package, e.g. in XMI files. */
  getNsURI(): string | undefined;
  setNsURI(uri: string): void;

  /** The preferred XML namespace prefix used when serializing. */
  getNsPrefix(): string | undefined;
  setNsPrefix(prefix: string): void;

  /**
   * The classes and data types in this package. Adding one here does not
   * set its EClassifier.getEPackage() - call setEPackage() too.
   */
  getEClassifiers(): EList<EClassifier>;

  /** Looks up a classifier in this package (not subpackages) by name. */
  getEClassifier(name: string): EClassifier | undefined;

  /**
   * Nested packages. Adding one here does not set its getESuperPackage() -
   * call setESuperPackage() too.
   */
  getESubpackages(): EList<EPackage>;

  /** The package this one is nested in, if any. */
  getESuperPackage(): EPackage | undefined;
  setESuperPackage(pkg: EPackage | undefined): void;

  /**
   * The factory EClass.createInstance() uses for this package's classes.
   * Setting it also sets the factory's own EPackage to this package.
   */
  getEFactoryInstance(): EFactory | undefined;
  setEFactoryInstance(factory: EFactory | undefined): void;
}
