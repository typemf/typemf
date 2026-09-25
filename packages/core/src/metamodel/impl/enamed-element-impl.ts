import { EStructuralFeature } from '../api/estructural-feature.js';
import { ENamedElement } from '../api/enamed-element.js';
import { EModelElementImpl } from './emodel-element-impl.js';

export abstract class ENamedElementImpl extends EModelElementImpl implements ENamedElement {
  protected _name = '';

  getName(): string {
    return this._name;
  }

  setName(name: string): void {
    this._name = name;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'name':
        return this.getName();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'name':
        this.setName(value as string);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      // '' is treated as the unset sentinel here - the closest analog to
      // real EMF's own NAME_EDEFAULT = null, given getName() promises a
      // real string (not string | undefined) as its return type.
      case 'name':
        return this._name !== '';
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'name':
        this._name = '';
        return;
      default:
        super.eUnset(feature);
    }
  }
}
