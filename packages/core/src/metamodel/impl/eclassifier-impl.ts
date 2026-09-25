import { EClassifier } from '../api/eclassifier.js';
import { EPackage } from '../api/epackage.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { ENamedElementImpl } from './enamed-element-impl.js';

export abstract class EClassifierImpl extends ENamedElementImpl implements EClassifier {
  private ePackage: EPackage | undefined;
  private classifierID = -1;

  getEPackage(): EPackage | undefined {
    return this.ePackage;
  }

  setEPackage(pkg: EPackage | undefined): void {
    this.ePackage = pkg;
  }

  getClassifierID(): number {
    return this.classifierID;
  }

  setClassifierID(id: number): void {
    this.classifierID = id;
  }

  abstract isInstance(value: unknown): boolean;

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      // ePackage is transient/non-changeable in real EMF (maintained as
      // the inverse of EPackage.eClassifiers) - readable, not settable
      // via eSet (see eSet below). classifierID is deliberately NOT
      // handled here at all - it's our own internal dispatch bookkeeping,
      // not a real modeled Ecore feature (Ecore.ecore declares no such
      // structural feature on EClassifier).
      case 'ePackage':
        return this.getEPackage();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      // ePackage: deliberately not handled - non-changeable, matching
      // real EMF's own generated code (no eSet case for it there either).
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'ePackage':
        return this.ePackage !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      default:
        super.eUnset(feature);
    }
  }
}
