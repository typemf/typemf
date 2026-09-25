import { EClass } from '../api/eclass.js';
import { EClassifier } from '../api/eclassifier.js';
import { EList } from '../api/elist.js';
import { EOperation } from '../api/eoperation.js';
import { EParameter } from '../api/eparameter.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { BasicEList } from './basic-elist.js';
import { ETypedElementImpl } from './etyped-element-impl.js';
import { metamodelEClassNotBootstrapped, replaceListContents } from './emodel-element-impl.js';

export class EOperationImpl extends ETypedElementImpl implements EOperation {
  private readonly parameters = new BasicEList<EParameter>();
  private readonly exceptions = new BasicEList<EClassifier>();

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EOperationImpl');
  }

  getEParameters(): EList<EParameter> {
    return this.parameters;
  }

  getEExceptions(): EList<EClassifier> {
    return this.exceptions;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'eParameters':
        return this.getEParameters();
      case 'eExceptions':
        return this.getEExceptions();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'eParameters':
        replaceListContents(this.parameters, value);
        return;
      case 'eExceptions':
        replaceListContents(this.exceptions, value);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'eParameters':
        return !this.parameters.isEmpty();
      case 'eExceptions':
        return !this.exceptions.isEmpty();
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'eParameters':
        this.parameters.clear();
        return;
      case 'eExceptions':
        this.exceptions.clear();
        return;
      default:
        super.eUnset(feature);
    }
  }
}
