import { EAttribute } from './EAttribute.js';
import { EClass } from './EClass.js';
import { EList } from './EList.js';
import { EStructuralFeature } from './EStructuralFeature.js';

export interface EReference extends EStructuralFeature {
  isContainment(): boolean;
  setContainment(value: boolean): void;

  isContainer(): boolean;

  isResolveProxies(): boolean;
  setResolveProxies(value: boolean): void;

  getEOpposite(): EReference | undefined;
  setEOpposite(value: EReference | undefined): void;

  getEReferenceType(): EClass | undefined;

  getEKeys(): EList<EAttribute>;
}
