import { EClass, EList, EStructuralFeature } from "../types/index.js";
import { EObjectImpl, BasicEList } from "./index.js";
import { EPackage } from "../types/EPackage.js";
import { EcorePackageImpl } from "./EcorePackageImpl.js";
import { EFactory } from "../types/EFactory.js";
import { EClassifier } from "../types/EClassifier.js";
import { ENamedElementImpl } from "./ENamedElementImpl.js";

export class EPackageImpl extends ENamedElementImpl implements EPackage {
  private _nsURI: string | undefined;
  private _nsPrefix: string | undefined;
  private _eFactoryInstance: EFactory | undefined;
  private readonly _eClassifiers = new BasicEList<EClassifier>(
    this,
    EcorePackageImpl.eINSTANCE.getEPackage_EClassifiers(),
  );
  private readonly _eSubpackages = new BasicEList<EPackage>(
    this,
    EcorePackageImpl.eINSTANCE.getEPackage_ESubpackages(),
  );
  private _eSuperPackage: EPackage | undefined;

  eClass(): EClass {
    return EcorePackageImpl.eINSTANCE.getEPackage();
  }

  getNsURI(): string | undefined {
    return this._nsURI;
  }

  setNsURI(value: string | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEPackage_NsURI(), value);
  }
  getNsPrefix(): string | undefined {
    return this._nsPrefix;
  }

  setNsPrefix(value: string | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEPackage_NsPrefix(), value);
  }
  getEFactoryInstance(): EFactory | undefined {
    return this._eFactoryInstance;
  }

  setEFactoryInstance(value: EFactory | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEPackage_EFactoryInstance(), value);
  }
  getEClassifiers(): EList<EClassifier> {
    return this._eClassifiers;
  }
  getESubpackages(): EList<EPackage> {
    return this._eSubpackages;
  }
  getESuperPackage(): EPackage | undefined {
    return this._eSuperPackage;
  }

  setESuperPackage(value: EPackage | undefined): void {
    this.eSet(EcorePackageImpl.eINSTANCE.getEPackage_ESuperPackage(), value);
  }

  getEClassifier(name: string): EClassifier | undefined {
    throw new Error(
      "EPackage.getEClassifier() has no body:typescript annotation - nothing to generate.",
    );
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getFeatureID()) {
      case 2:
        return this._nsURI;
      case 3:
        return this._nsPrefix;
      case 4:
        return this._eFactoryInstance;
      case 5:
        return this._eClassifiers;
      case 6:
        return this._eSubpackages;
      case 7:
        return this._eSuperPackage;
      default:
        return super.eGet(feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 2: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 3: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 4: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      case 5: {
        const list = this._eClassifiers;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EClassifier);
        return;
      }
      case 6: {
        const list = this._eSubpackages;
        const items =
          value === undefined || value === null
            ? []
            : [...(value as Iterable<unknown>)];
        list.clear();
        for (const item of items) list.add(item as EPackage);
        return;
      }
      case 7: {
        const oldValue = this.eGet(feature);
        if (oldValue === value) return;
        this.eBasicSetValue(feature, value);
        this.eDidRemove(feature, oldValue);
        this.eDidAdd(feature, value);
        return;
      }
      default:
        super.eSet(feature, value);
        return;
    }
  }

  eBasicSetValue(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getFeatureID()) {
      case 2:
        this._nsURI = value as string | undefined;
        return;
      case 3:
        this._nsPrefix = value as string | undefined;
        return;
      case 4:
        this._eFactoryInstance = value as EFactory | undefined;
        return;
      case 7:
        this._eSuperPackage = value as EPackage | undefined;
        return;
      default:
        super.eBasicSetValue(feature, value);
        return;
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getFeatureID()) {
      case 2:
        return this._nsURI !== undefined;
      case 3:
        return this._nsPrefix !== undefined;
      case 4:
        return this._eFactoryInstance !== undefined;
      case 5:
        return this._eClassifiers.size() !== 0;
      case 6:
        return this._eSubpackages.size() !== 0;
      case 7:
        return this._eSuperPackage !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getFeatureID()) {
      case 2: {
        const oldValue = this._nsURI;
        this._nsURI = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 3: {
        const oldValue = this._nsPrefix;
        this._nsPrefix = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 4: {
        const oldValue = this._eFactoryInstance;
        this._eFactoryInstance = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      case 5:
        this._eClassifiers.clear();
        return;
      case 6:
        this._eSubpackages.clear();
        return;
      case 7: {
        const oldValue = this._eSuperPackage;
        this._eSuperPackage = undefined;
        this.eDidRemove(feature, oldValue);
        return;
      }
      default:
        super.eUnset(feature);
        return;
    }
  }
}
