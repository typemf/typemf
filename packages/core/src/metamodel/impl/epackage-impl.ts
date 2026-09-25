import { EClass } from '../api/eclass.js';
import { EClassifier } from '../api/eclassifier.js';
import { EFactory } from '../api/efactory.js';
import { EList } from '../api/elist.js';
import { EObject } from '../api/eobject.js';
import { EPackage } from '../api/epackage.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { BasicEList } from './basic-elist.js';
import { ENamedElementImpl } from './enamed-element-impl.js';
import { metamodelEClassNotBootstrapped, replaceListContents } from './emodel-element-impl.js';

export class EPackageImpl extends ENamedElementImpl implements EPackage {
  private nsURI: string | undefined;
  private nsPrefix: string | undefined;
  private readonly classifiers = new BasicEList<EClassifier>();
  private readonly subpackages = new BasicEList<EPackage>();
  private superPackage: EPackage | undefined;
  private factory: EFactory | undefined;

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EPackageImpl');
  }

  getNsURI(): string | undefined {
    return this.nsURI;
  }

  setNsURI(uri: string): void {
    this.nsURI = uri;
  }

  getNsPrefix(): string | undefined {
    return this.nsPrefix;
  }

  setNsPrefix(prefix: string): void {
    this.nsPrefix = prefix;
  }

  getEClassifiers(): EList<EClassifier> {
    return this.classifiers;
  }

  getEClassifier(name: string): EClassifier | undefined {
    return this.classifiers.find((c) => c.getName() === name);
  }

  getESubpackages(): EList<EPackage> {
    return this.subpackages;
  }

  getESuperPackage(): EPackage | undefined {
    return this.superPackage;
  }

  setESuperPackage(pkg: EPackage | undefined): void {
    this.superPackage = pkg;
  }

  getEFactoryInstance(): EFactory | undefined {
    return this.factory;
  }

  setEFactoryInstance(factory: EFactory | undefined): void {
    this.factory = factory;
    factory?.setEPackage(this);
  }

  override eContents(): EList<EObject> {
    const result = new BasicEList<EObject>();
    for (const c of this.classifiers) result.add(c as unknown as EObject);
    for (const p of this.subpackages) result.add(p as unknown as EObject);
    return result;
  }

  /** Cascades to every own classifier and subpackage, matching real EMF's EPackageImpl.freeze() exactly. */
  protected override freeze(): void {
    for (const classifier of this.classifiers) {
      this.freezeChild(classifier);
    }
    for (const sub of this.subpackages) {
      this.freezeChild(sub);
    }
    super.freeze();
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'nsURI':
        return this.getNsURI();
      case 'nsPrefix':
        return this.getNsPrefix();
      case 'eClassifiers':
        return this.getEClassifiers();
      case 'eSubpackages':
        return this.getESubpackages();
      // eSuperPackage is transient/non-changeable in real EMF (maintained
      // as the inverse of EPackage.eSubpackages) - readable, not settable.
      case 'eSuperPackage':
        return this.getESuperPackage();
      // eFactoryInstance IS changeable in real Ecore.ecore (transient, but
      // no changeable="false" - unlike eSuperPackage right above it) - so,
      // unlike every other transient reference in this file, it DOES get
      // an eSet case below.
      case 'eFactoryInstance':
        return this.getEFactoryInstance();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'nsURI':
        this.setNsURI(value as string);
        return;
      case 'nsPrefix':
        this.setNsPrefix(value as string);
        return;
      case 'eClassifiers':
        replaceListContents(this.classifiers, value);
        return;
      case 'eSubpackages':
        replaceListContents(this.subpackages, value);
        return;
      case 'eFactoryInstance':
        this.setEFactoryInstance(value as EFactory | undefined);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'nsURI':
        return this.nsURI !== undefined;
      case 'nsPrefix':
        return this.nsPrefix !== undefined;
      case 'eClassifiers':
        return !this.classifiers.isEmpty();
      case 'eSubpackages':
        return !this.subpackages.isEmpty();
      case 'eSuperPackage':
        return this.superPackage !== undefined;
      case 'eFactoryInstance':
        return this.factory !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'nsURI':
        this.nsURI = undefined;
        return;
      case 'nsPrefix':
        this.nsPrefix = undefined;
        return;
      case 'eClassifiers':
        this.classifiers.clear();
        return;
      case 'eSubpackages':
        this.subpackages.clear();
        return;
      case 'eFactoryInstance':
        this.setEFactoryInstance(undefined);
        return;
      default:
        super.eUnset(feature);
    }
  }
}
