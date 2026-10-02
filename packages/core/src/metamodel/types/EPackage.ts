import { EClassifier } from './EClassifier.js';
import { EFactory } from './EFactory.js';
import { EList } from './EList.js';
import { ENamedElement } from './ENamedElement.js';

export interface EPackage extends ENamedElement {
  getNsURI(): string | undefined;
  setNsURI(value: string | undefined): void;

  getNsPrefix(): string | undefined;
  setNsPrefix(value: string | undefined): void;

  getEFactoryInstance(): EFactory | undefined;
  setEFactoryInstance(value: EFactory | undefined): void;

  getEClassifiers(): EList<EClassifier>;

  getESubpackages(): EList<EPackage>;

  getESuperPackage(): EPackage | undefined;

  getEClassifier(name: string): EClassifier | undefined;
}
