import { BasicEList } from './BasicEList.js';
import { EModelElementImpl } from './EModelElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EDataType } from '../types/EDataType.js';
import { EFactory } from '../types/EFactory.js';
import { EObject } from '../types/EObject.js';
import { EPackage } from '../types/EPackage.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { DynamicEObjectImpl } from './DynamicEObjectImpl.js';

export class EFactoryImpl extends EModelElementImpl implements EFactory {
  private _ePackage: EPackage | undefined;

  eClass(): EClass {
    return getEcorePackageRef().getEFactory();
  }

  getEPackage(): EPackage | undefined {
    return this._ePackage;
  }
  setEPackage(value: EPackage | undefined): void {
    this.eSet(getEcorePackageRef().getEFactory_EPackage(), value);
  }
  create(eClass: EClass): EObject {
    if (eClass.isAbstract() || eClass.isInterface()) {
      throw new Error(`Cannot create an instance of '${eClass.getName()}': it is abstract or an interface.`);
    }
    console.warn(
      `No factory recognizes classifier id ${eClass.getClassifierID()} (${eClass.getName()}) - falling back to a DynamicEObjectImpl. ` +
        'Add a concrete factory for it to avoid this.'
    );
    return new DynamicEObjectImpl(eClass);
  }
  createFromString(eDataType: EDataType, literalValue: string): unknown {
    if (this.getEPackage() !== undefined && eDataType.getEPackage() !== this.getEPackage()) {
      throw new Error(`The datatype '${eDataType.getName()}' is not a valid classifier of this factory's package.`);
    }
    switch (eDataType.getName()) {
      case 'EString':
        return literalValue;
      case 'EInt':
      case 'EIntegerObject':
      case 'ELong':
      case 'ELongObject':
      case 'EDouble':
      case 'EDoubleObject':
      case 'EFloat':
      case 'EFloatObject':
      case 'EShort':
      case 'EShortObject':
      case 'EByte':
      case 'EByteObject':
        return Number(literalValue);
      case 'EBigInteger':
        return BigInt(literalValue);
      case 'EBoolean':
      case 'EBooleanObject':
        return literalValue === 'true';
      case 'EChar':
      case 'ECharacterObject':
        return literalValue.charAt(0);
      case 'EDate':
        return new Date(literalValue);
      default:
        return literalValue;
    }
  }
  convertToString(eDataType: EDataType, instanceValue: unknown): string | undefined {
    if (this.getEPackage() !== undefined && eDataType.getEPackage() !== this.getEPackage()) {
      throw new Error(`The datatype '${eDataType.getName()}' is not a valid classifier of this factory's package.`);
    }
    if (eDataType.getName() === 'EDate' && instanceValue instanceof Date) {
      return instanceValue.toISOString();
    }
    return String(instanceValue);
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1:
        return this._ePackage;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        const wasSet = this.eIsSet(feature);
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        this.eNotify({
          eventType: 'SET',
          notifier: this,
          feature,
          oldValue,
          newValue: value,
          position: undefined,
          wasSet,
        });
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
      case 1:
        this._ePackage = value as EPackage | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1:
        return this._ePackage !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 1: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._ePackage;
        this._ePackage = undefined;
        this.eDidRemove(feature, oldValue);
        this.eNotify({
          eventType: 'UNSET',
          notifier: this,
          feature,
          oldValue,
          newValue: undefined,
          position: undefined,
          wasSet,
        });
        return;
      }

      default:
        super.eUnset(feature);
        return;
    }
  }
}
