import { EAttribute } from '../api/eattribute.js';
import { EClass } from '../api/eclass.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { EStructuralFeatureImpl } from './estructural-feature-impl.js';
import { metamodelEClassNotBootstrapped } from './emodel-element-impl.js';

export class EAttributeImpl extends EStructuralFeatureImpl implements EAttribute {
  private idFlag = false;

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EAttributeImpl');
  }

  isID(): boolean {
    return this.idFlag;
  }

  setID(isID: boolean): void {
    this.idFlag = isID;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'iD':
        return this.isID();
      // eAttributeType is derived in real EMF (changeable=false, volatile,
      // transient) but trivially so - an EAttribute's type IS its
      // eAttributeType by definition, so this is a real, correct formula,
      // not a stub. No eSet case, matching every other derived feature.
      case 'eAttributeType':
        return this.getEType();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'iD':
        this.setID(value as boolean);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'iD':
        return this.idFlag !== false;
      case 'eAttributeType':
        return this.getEType() !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'iD':
        this.idFlag = false;
        return;
      default:
        super.eUnset(feature);
    }
  }
}
