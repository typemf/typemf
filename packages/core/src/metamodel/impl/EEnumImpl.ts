import { BasicEList } from './BasicEList.js';
import { EDataTypeImpl } from './EDataTypeImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EEnum } from '../types/EEnum.js';
import { EEnumLiteral } from '../types/EEnumLiteral.js';
import { EList } from '../types/EList.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';

/** A data type whose values are a fixed set of literals. */
export class EEnumImpl extends EDataTypeImpl implements EEnum {
  private _eLiteralsCache: BasicEList<EEnumLiteral> | undefined;

  private get _eLiterals(): BasicEList<EEnumLiteral> {
    this._eLiteralsCache ??= new BasicEList<EEnumLiteral>(this, getEcorePackageRef().getEEnum_ELiterals());
    return this._eLiteralsCache;
  }

  eClass(): EClass {
    return getEcorePackageRef().getEEnum();
  }

  getELiterals(): EList<EEnumLiteral> {
    return this._eLiterals;
  }

  getEEnumLiteral(name: string): EEnumLiteral | undefined;
  getEEnumLiteral(value: number): EEnumLiteral | undefined;
  getEEnumLiteral(nameOrValue: string | number): EEnumLiteral | undefined {
    if (typeof nameOrValue === 'string') {
      const name = nameOrValue as string;
      return this.getELiterals().find((literal) => literal.getName() === name);
    }
    if (typeof nameOrValue === 'number') {
      const value = nameOrValue as number;
      return this.getELiterals().find((literal) => literal.getValue() === value);
    }
    throw new Error('EEnum.getEEnumLiteral(): no overload matches the given arguments.');
  }
  getEEnumLiteralByLiteral(literal: string): EEnumLiteral | undefined {
    return this.getELiterals().find((candidate) => candidate.getLiteral() === literal);
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 9:
        return this._eLiterals;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
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
  eBasicSetValue(feature: EStructuralFeature | number, value: unknown): void {
    const featureId = typeof feature === 'number' ? feature : feature.getFeatureID();
    switch (featureId) {
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 9:
        this._eLiteralsCache ??= new BasicEList<EEnumLiteral>(this);
        return this._eLiteralsCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 9:
        return this._eLiteralsCache !== undefined && this._eLiteralsCache.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 9:
        this._eLiteralsCache?.clear();
        return;

      default:
        super.eUnset(feature);
        return;
    }
  }
}
