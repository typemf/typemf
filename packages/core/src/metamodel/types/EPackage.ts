import { EClassifier, EFactory, EList, ENamedElement } from "../../index.js";

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
  setESuperPackage(value: EPackage | undefined): void;

  getEClassifier(name: string): EClassifier;
}
