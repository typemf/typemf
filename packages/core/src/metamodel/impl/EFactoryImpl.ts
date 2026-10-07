import { BasicEList } from './BasicEList.js';
import { EModelElementImpl } from './EModelElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EDataType } from '../types/EDataType.js';
import { EFactory } from '../types/EFactory.js';
import { EObject } from '../types/EObject.js';
import { EPackage } from '../types/EPackage.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { isEEnum } from '../util/EcoreTypeGuards.js';
import { DynamicEObjectImpl } from './DynamicEObjectImpl.js';

/** Creates instances of a package's classes and converts data values to and from strings. */
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
    const invalid = (): Error =>
      new Error(`'${literalValue}' is not a valid value of the datatype '${eDataType.getName()}'.`);
    const text = literalValue.trim();
    const integer = (min?: bigint, max?: bigint): bigint => {
      if (!/^[+-]?\d+$/.test(text)) throw invalid();
      const value = BigInt(text);
      if ((min !== undefined && value < min) || (max !== undefined && value > max)) throw invalid();
      return value;
    };
    const decimal = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
    if (isEEnum(eDataType)) {
      const literal = eDataType.getEEnumLiteralByLiteral(literalValue);
      if (literal === undefined) throw invalid();
      return literal.getLiteral();
    }
    switch (eDataType.getName()) {
      case 'EString':
        return literalValue;
      case 'EInt':
      case 'EIntegerObject':
        return Number(integer(-2147483648n, 2147483647n));
      case 'EShort':
      case 'EShortObject':
        return Number(integer(-32768n, 32767n));
      case 'EByte':
      case 'EByteObject':
        return Number(integer(-128n, 127n));
      case 'ELong':
      case 'ELongObject':
        return integer(-9223372036854775808n, 9223372036854775807n);
      case 'EBigInteger':
        return integer();
      case 'EDouble':
      case 'EDoubleObject':
      case 'EFloat':
      case 'EFloatObject':
        if (text === 'NaN') return NaN;
        if (text === 'INF' || text === 'Infinity') return Infinity;
        if (text === '-INF' || text === '-Infinity') return -Infinity;
        if (!decimal.test(text)) throw invalid();
        return Number(text);
      case 'EBigDecimal':
        if (!decimal.test(text)) throw invalid();
        return text;
      case 'EBoolean':
      case 'EBooleanObject':
        if (text.toLowerCase() === 'true') return true;
        if (text.toLowerCase() === 'false') return false;
        throw invalid();
      case 'EChar':
      case 'ECharacterObject':
        if (literalValue.length !== 1) throw invalid();
        return literalValue;
      case 'EDate': {
        const date = new Date(text);
        if (Number.isNaN(date.getTime())) throw invalid();
        return date;
      }
      case 'EByteArray': {
        if (!/^([0-9a-fA-F]{2})*$/.test(text)) throw invalid();
        const bytes = new Uint8Array(text.length / 2);
        for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(text.slice(2 * i, 2 * i + 2), 16);
        return bytes;
      }
      default:
        return literalValue;
    }
  }
  convertToString(eDataType: EDataType, instanceValue: unknown): string | undefined {
    if (this.getEPackage() !== undefined && eDataType.getEPackage() !== this.getEPackage()) {
      throw new Error(`The datatype '${eDataType.getName()}' is not a valid classifier of this factory's package.`);
    }
    if (instanceValue === undefined || instanceValue === null) return undefined;
    if (instanceValue instanceof Date) return instanceValue.toISOString();
    if (instanceValue instanceof Uint8Array) {
      return [...instanceValue].map((byte) => byte.toString(16).padStart(2, '0').toUpperCase()).join('');
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
