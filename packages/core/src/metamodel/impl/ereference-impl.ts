import { EClass } from '../api/eclass.js';
import { EReference } from '../api/ereference.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { EStructuralFeatureImpl } from './estructural-feature-impl.js';
import { metamodelEClassNotBootstrapped } from './emodel-element-impl.js';

export class EReferenceImpl extends EStructuralFeatureImpl implements EReference {
  private containmentFlag = false;
  private opposite: EReference | undefined;
  private resolveProxiesFlag = true;

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EReferenceImpl');
  }

  isContainment(): boolean {
    return this.containmentFlag;
  }

  setContainment(containment: boolean): void {
    this.containmentFlag = containment;
  }

  getEOpposite(): EReference | undefined {
    return this.opposite;
  }

  setEOpposite(opposite: EReference | undefined): void {
    this.opposite = opposite;
  }

  isResolveProxies(): boolean {
    return this.resolveProxiesFlag;
  }

  setResolveProxies(resolve: boolean): void {
    this.resolveProxiesFlag = resolve;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'containment':
        return this.isContainment();
      case 'eOpposite':
        return this.getEOpposite();
      case 'resolveProxies':
        return this.isResolveProxies();
      // container/eReferenceType are derived in real EMF - both verified
      // against the real Java source (EReferenceImpl.isContainer() /
      // getEReferenceType()) rather than assumed. No eSet case, matching
      // every other derived feature.
      case 'container':
        return this.opposite?.isContainment() ?? false;
      case 'eReferenceType':
        return this.getEType();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'containment':
        this.setContainment(value as boolean);
        return;
      case 'eOpposite':
        this.setEOpposite(value as EReference | undefined);
        return;
      case 'resolveProxies':
        this.setResolveProxies(value as boolean);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'containment':
        return this.containmentFlag !== false;
      case 'eOpposite':
        return this.opposite !== undefined;
      case 'resolveProxies':
        return this.resolveProxiesFlag !== true;
      case 'container':
      case 'eReferenceType':
        return true;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'containment':
        this.containmentFlag = false;
        return;
      case 'eOpposite':
        this.opposite = undefined;
        return;
      case 'resolveProxies':
        this.resolveProxiesFlag = true;
        return;
      default:
        super.eUnset(feature);
    }
  }
}
