import { EClass } from '../api/eclass.js';
import { EDataType } from '../api/edata-type.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { EClassifierImpl } from './eclassifier-impl.js';
import { metamodelEClassNotBootstrapped } from './emodel-element-impl.js';

export class EDataTypeImpl extends EClassifierImpl implements EDataType {
  private serializable = true;

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EDataTypeImpl');
  }

  isSerializable(): boolean {
    return this.serializable;
  }

  setSerializable(serializable: boolean): void {
    this.serializable = serializable;
  }

  isInstance(value: unknown): boolean {
    // Primitive EDataTypes accept anything by default; built-in types
    // (EString/EInt/...) are refined in registry/builtin-datatypes.ts.
    return value !== undefined;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'serializable':
        return this.isSerializable();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'serializable':
        this.setSerializable(value as boolean);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'serializable':
        return this.serializable !== true;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'serializable':
        this.serializable = true;
        return;
      default:
        super.eUnset(feature);
    }
  }
}
