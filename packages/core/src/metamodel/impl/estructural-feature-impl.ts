import { EClass } from '../api/eclass.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { ETypedElementImpl } from './etyped-element-impl.js';

export abstract class EStructuralFeatureImpl extends ETypedElementImpl implements EStructuralFeature {
  private featureID = -1;
  private containingClass: EClass | undefined;
  private changeable = true;
  private volatileFlag = false;
  private transientFlag = false;
  private derived = false;
  private unsettable = false;

  getFeatureID(): number {
    return this.featureID;
  }

  setFeatureID(id: number): void {
    this.featureID = id;
  }

  getEContainingClass(): EClass | undefined {
    return this.containingClass;
  }

  setEContainingClass(owner: EClass | undefined): void {
    this.containingClass = owner;
  }

  isChangeable(): boolean {
    return this.changeable;
  }

  setChangeable(changeable: boolean): void {
    this.changeable = changeable;
  }

  isVolatile(): boolean {
    return this.volatileFlag;
  }

  setVolatile(volatile: boolean): void {
    this.volatileFlag = volatile;
  }

  isTransient(): boolean {
    return this.transientFlag;
  }

  setTransient(transientValue: boolean): void {
    this.transientFlag = transientValue;
  }

  isDerived(): boolean {
    return this.derived;
  }

  setDerived(derived: boolean): void {
    this.derived = derived;
  }

  isUnsettable(): boolean {
    return this.unsettable;
  }

  setUnsettable(unsettable: boolean): void {
    this.unsettable = unsettable;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      // eContainingClass is transient/non-changeable in real EMF
      // (maintained as the inverse of EClass.eStructuralFeatures) -
      // readable, not settable via eSet. featureID is deliberately NOT
      // handled - internal dispatch bookkeeping, like classifierID, not a
      // real modeled Ecore feature.
      case 'eContainingClass':
        return this.getEContainingClass();
      case 'changeable':
        return this.isChangeable();
      case 'volatile':
        return this.isVolatile();
      case 'transient':
        return this.isTransient();
      case 'derived':
        return this.isDerived();
      case 'unsettable':
        return this.isUnsettable();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      // eContainingClass: deliberately not handled - non-changeable.
      case 'changeable':
        this.setChangeable(value as boolean);
        return;
      case 'volatile':
        this.setVolatile(value as boolean);
        return;
      case 'transient':
        this.setTransient(value as boolean);
        return;
      case 'derived':
        this.setDerived(value as boolean);
        return;
      case 'unsettable':
        this.setUnsettable(value as boolean);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'eContainingClass':
        return this.containingClass !== undefined;
      // Real EMF's EDEFAULTs: changeable=true, the other four=false.
      case 'changeable':
        return this.changeable !== true;
      case 'volatile':
        return this.volatileFlag !== false;
      case 'transient':
        return this.transientFlag !== false;
      case 'derived':
        return this.derived !== false;
      case 'unsettable':
        return this.unsettable !== false;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'changeable':
        this.changeable = true;
        return;
      case 'volatile':
        this.volatileFlag = false;
        return;
      case 'transient':
        this.transientFlag = false;
        return;
      case 'derived':
        this.derived = false;
        return;
      case 'unsettable':
        this.unsettable = false;
        return;
      default:
        super.eUnset(feature);
    }
  }
}
