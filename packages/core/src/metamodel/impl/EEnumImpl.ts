import { EClass, EList, EStructuralFeature } from '../types/index.js';
import { EObjectImpl, BasicEList } from './index.js';
import { EEnum } from '../types/EEnum.js';
import { EcorePackageImpl } from './EcorePackageImpl.js';
import { EEnumLiteral } from '../types/EEnumLiteral.js';
import { EDataTypeImpl } from './EDataTypeImpl.js';


export class EEnumImpl extends EDataTypeImpl implements EEnum {
  private readonly _eLiterals = new BasicEList<EEnumLiteral>(this, EcorePackageImpl.eINSTANCE.getEEnum_ELiterals());

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEEnum();
  }

  getELiterals(): EList<EEnumLiteral> {
    return this._eLiterals;
  }

  getEEnumLiteral(name: string): EEnumLiteral | undefined;
  getEEnumLiteral(value: number): EEnumLiteral | undefined;
  getEEnumLiteral(nameOrValue: string | number): EEnumLiteral | undefined {
    throw new Error('EEnum.getEEnumLiteral() is overloaded with no body:typescript annotation - nothing to generate.');
  }

  getEEnumLiteralByLiteral(literal: string): EEnumLiteral | undefined {
    throw new Error('EEnum.getEEnumLiteralByLiteral() has no body:typescript annotation - nothing to generate.');
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 9: return this._eLiterals;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 9: {
        const list = this._eLiterals;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EEnumLiteral);
        return;
      }
      default:
        super.eSet(feature, value);
        return;
    }
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 9: return this._eLiterals.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 9: this._eLiterals.clear(); return;
      default:
        super.eUnset(feature);
        return;
    }
  }
}
