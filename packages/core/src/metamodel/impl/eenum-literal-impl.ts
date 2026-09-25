import { EClass } from '../api/eclass.js';
import { EEnum } from '../api/eenum.js';
import { EEnumLiteral } from '../api/eenum-literal.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { ENamedElementImpl } from './enamed-element-impl.js';
import { metamodelEClassNotBootstrapped } from './emodel-element-impl.js';

export class EEnumLiteralImpl extends ENamedElementImpl implements EEnumLiteral {
  private value = 0;
  private literal: string | undefined;
  private eEnum: EEnum | undefined;

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EEnumLiteralImpl');
  }

  getValue(): number {
    return this.value;
  }

  setValue(value: number): void {
    this.value = value;
  }

  getLiteral(): string {
    return this.literal ?? this.getName();
  }

  setLiteral(literal: string): void {
    this.literal = literal;
  }

  getEEnum(): EEnum | undefined {
    return this.eEnum;
  }

  /** Internal - called by EEnumImpl when a literal is added. */
  setEEnum(owner: EEnum | undefined): void {
    this.eEnum = owner;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'value':
        return this.getValue();
      case 'literal':
        return this.getLiteral();
      // eEnum is transient/non-changeable in real EMF (maintained as the
      // inverse of EEnum.eLiterals) - readable, not settable via eSet.
      case 'eEnum':
        return this.getEEnum();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'value':
        this.setValue(value as number);
        return;
      case 'literal':
        this.setLiteral(value as string);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'value':
        return this.value !== 0;
      // The raw field, not getLiteral()'s name-fallback - "is set" means
      // "explicitly given a literal", distinct from "currently returns a
      // usable string because it falls back to the name".
      case 'literal':
        return this.literal !== undefined;
      case 'eEnum':
        return this.eEnum !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'value':
        this.value = 0;
        return;
      case 'literal':
        this.literal = undefined;
        return;
      default:
        super.eUnset(feature);
    }
  }
}
