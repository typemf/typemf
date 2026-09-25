import { EAttribute, EClass, EList, EStructuralFeature } from "../../index.js";

export interface EReference extends EStructuralFeature {
  getContainment(): boolean | undefined;
  setContainment(value: boolean | undefined): void;

  getContainer(): boolean | undefined;

  getResolveProxies(): boolean | undefined;
  setResolveProxies(value: boolean | undefined): void;

  getEOpposite(): EReference | undefined;
  setEOpposite(value: EReference | undefined): void;

  getEReferenceType(): EClass | undefined;

  getEKeys(): EList<EAttribute>;
}
