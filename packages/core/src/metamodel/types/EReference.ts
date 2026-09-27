import { EObject } from './EObject.js';
import { EList } from './EList.js';
import { EStructuralFeature } from './EStructuralFeature.js';
import { EClass } from './EClass.js';
import { EAttribute } from './EAttribute.js';


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
