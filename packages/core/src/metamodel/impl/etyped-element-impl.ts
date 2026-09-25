import { EClassifier } from '../api/eclassifier.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { ETypedElement } from '../api/etyped-element.js';
import { ENamedElementImpl } from './enamed-element-impl.js';

export abstract class ETypedElementImpl extends ENamedElementImpl implements ETypedElement {
  private eType: EClassifier | undefined;
  private lowerBound = 0;
  private upperBound = 1;
  private ordered = true;
  private unique = true;

  getEType(): EClassifier | undefined {
    return this.eType;
  }

  setEType(type: EClassifier | undefined): void {
    this.eType = type;
  }

  getLowerBound(): number {
    return this.lowerBound;
  }

  setLowerBound(bound: number): void {
    this.lowerBound = bound;
  }

  getUpperBound(): number {
    return this.upperBound;
  }

  setUpperBound(bound: number): void {
    this.upperBound = bound;
  }

  isMany(): boolean {
    return this.upperBound === -1 || this.upperBound > 1;
  }

  isRequired(): boolean {
    return this.lowerBound >= 1;
  }

  isOrdered(): boolean {
    return this.ordered;
  }

  setOrdered(ordered: boolean): void {
    this.ordered = ordered;
  }

  isUnique(): boolean {
    return this.unique;
  }

  setUnique(unique: boolean): void {
    this.unique = unique;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'eType':
        return this.getEType();
      case 'lowerBound':
        return this.getLowerBound();
      case 'upperBound':
        return this.getUpperBound();
      case 'ordered':
        return this.isOrdered();
      case 'unique':
        return this.isUnique();
      // many/required are derived (computed from lowerBound/upperBound) -
      // readable, but real EMF generates no eSet case for a derived
      // feature either, so neither do we.
      case 'many':
        return this.isMany();
      case 'required':
        return this.isRequired();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'eType':
        this.setEType(value as EClassifier | undefined);
        return;
      case 'lowerBound':
        this.setLowerBound(value as number);
        return;
      case 'upperBound':
        this.setUpperBound(value as number);
        return;
      case 'ordered':
        this.setOrdered(value as boolean);
        return;
      case 'unique':
        this.setUnique(value as boolean);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'eType':
        return this.eType !== undefined;
      // Real EMF's own EDEFAULTs for these: lowerBound 0, upperBound 1,
      // ordered/unique true - "is set" means "differs from that default",
      // matching real EMF's own EDEFAULT-comparison convention exactly
      // (unlike `name`, these already have real, meaningful default
      // values to compare against - no sentinel-value judgment call
      // needed here).
      case 'lowerBound':
        return this.lowerBound !== 0;
      case 'upperBound':
        return this.upperBound !== 1;
      case 'ordered':
        return this.ordered !== true;
      case 'unique':
        return this.unique !== true;
      case 'many':
      case 'required':
        return true; // derived features are always considered "set" - they're always computable
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'eType':
        this.eType = undefined;
        return;
      case 'lowerBound':
        this.lowerBound = 0;
        return;
      case 'upperBound':
        this.upperBound = 1;
        return;
      case 'ordered':
        this.ordered = true;
        return;
      case 'unique':
        this.unique = true;
        return;
      default:
        super.eUnset(feature);
    }
  }
}
