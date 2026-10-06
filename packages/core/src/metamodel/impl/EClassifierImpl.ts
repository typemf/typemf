import { BasicEList } from './BasicEList.js';
import { ENamedElementImpl } from './ENamedElementImpl.js';
import { getEcorePackageRef } from './EcorePackageRef.js';
import { EClass } from '../types/EClass.js';
import { EClassifier } from '../types/EClassifier.js';
import { EList } from '../types/EList.js';
import { EPackage } from '../types/EPackage.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { ETypeParameter } from '../types/ETypeParameter.js';
import { EObject } from '../types/EObject';
import { TypeScriptClass } from '../types/TypeScriptClass';
import { EObjectImpl } from './EObjectImpl';

export class EClassifierImpl extends ENamedElementImpl implements EClassifier {
  private _instanceClassName: string | undefined;

  private _instanceClass: TypeScriptClass<unknown> | undefined;

  private _defaultValue: unknown;

  private _instanceTypeName: string | undefined;

  private _ePackage: EPackage | undefined;

  private _eTypeParametersCache: BasicEList<ETypeParameter> | undefined;

  private get _eTypeParameters(): BasicEList<ETypeParameter> {
    this._eTypeParametersCache ??= new BasicEList<ETypeParameter>(
      this,
      getEcorePackageRef().getEClassifier_ETypeParameters()
    );
    return this._eTypeParametersCache;
  }

  private classifierId = -1;

  getClassifierID(): number {
    return this.classifierId;
  }

  setClassifierID(id: number): void {
    this.classifierId = id;
  }

  eClass(): EClass {
    return getEcorePackageRef().getEClassifier();
  }

  getInstanceClassName(): string | undefined {
    return this._instanceClassName;
  }
  setInstanceClassName(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEClassifier_InstanceClassName(), value);
  }
  getInstanceClass(): TypeScriptClass<unknown> | undefined {
    return this._instanceClass;
  }

  setInstanceClass(value: TypeScriptClass<unknown> | undefined): void {
    this._instanceClass = value;
  }
  getDefaultValue(): unknown {
    return this._defaultValue;
  }

  setDefaultValue(value: unknown): void {
    this._defaultValue = value;
  }
  getInstanceTypeName(): string | undefined {
    return this._instanceTypeName;
  }
  setInstanceTypeName(value: string | undefined): void {
    this.eSet(getEcorePackageRef().getEClassifier_InstanceTypeName(), value);
  }
  getEPackage(): EPackage | undefined {
    return this._ePackage;
  }

  setEPackage(value: EPackage | undefined): void {
    this._ePackage = value;
  }
  getETypeParameters(): EList<ETypeParameter> {
    return this._eTypeParameters;
  }
  isInstance(object: unknown): boolean {
    switch (this.eClass().getName()) {
      case 'EClass':
        return object instanceof EObjectImpl && (this as unknown as EClass).isSuperTypeOf((object as EObject).eClass());
      default:
        switch (this.getName()) {
          case 'EString':
          case 'EChar':
          case 'ECharacterObject':
            return typeof object === 'string';
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
            return typeof object === 'number';
          case 'EBigInteger':
            return typeof object === 'bigint';
          case 'EBoolean':
          case 'EBooleanObject':
            return typeof object === 'boolean';
          case 'EDate':
            return object instanceof Date;
          default:
            return object !== undefined && object !== null;
        }
    }
  }

  eGet(feature: EStructuralFeature): unknown {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2:
        return this._instanceClassName;
      case 3:
        return this._instanceClass;
      case 4:
        return this._defaultValue;
      case 5:
        return this._instanceTypeName;
      case 6:
        return this._ePackage;
      case 7:
        return this._eTypeParameters;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2: {
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
      case 5: {
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
      case 7: {
        const list = this._eTypeParameters;
        const items = value === undefined || value === null ? [] : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as ETypeParameter);
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
      case 2:
        this._instanceClassName = value as string | undefined;
        return;
      case 3:
        this._instanceClass = value as TypeScriptClass<unknown> | undefined;
        return;
      case 4:
        this._defaultValue = value as unknown;
        return;
      case 5:
        this._instanceTypeName = value as string | undefined;
        return;
      case 6:
        this._ePackage = value as EPackage | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }
  eBootstrapList(featureId: number): BasicEList<unknown> {
    switch (featureId) {
      case 7:
        this._eTypeParametersCache ??= new BasicEList<ETypeParameter>(this);
        return this._eTypeParametersCache;
      default:
        return super.eBootstrapList(featureId);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2:
        return this._instanceClassName !== undefined;
      case 3:
        return this._instanceClass !== undefined;
      case 4:
        return this._defaultValue !== undefined;
      case 5:
        return this._instanceTypeName !== undefined;
      case 6:
        return this._ePackage !== undefined;
      case 7:
        return this._eTypeParametersCache !== undefined && this._eTypeParametersCache.size() !== 0;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    this.requireOwnFeature(feature);
    switch (feature.getFeatureID()) {
      case 2: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._instanceClassName;
        this._instanceClassName = undefined;
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

      case 3: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._instanceClass;
        this._instanceClass = undefined;
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

      case 4: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._defaultValue;
        this._defaultValue = undefined;
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

      case 5: {
        const wasSet = this.eIsSet(feature);
        const oldValue = this._instanceTypeName;
        this._instanceTypeName = undefined;
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

      case 6: {
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

      case 7:
        this._eTypeParametersCache?.clear();
        return;

      default:
        super.eUnset(feature);
        return;
    }
  }
}
