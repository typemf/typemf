import { EClass } from '../api/eclass.js';
import { EEnum } from '../api/eenum.js';
import { EEnumLiteral } from '../api/eenum-literal.js';
import { EList } from '../api/elist.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { BasicEList } from './basic-elist.js';
import { EDataTypeImpl } from './edata-type-impl.js';
import { metamodelEClassNotBootstrapped } from './emodel-element-impl.js';

export class EEnumImpl extends EDataTypeImpl implements EEnum {
  private readonly literals = new BasicEList<EEnumLiteral>();

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EEnumImpl');
  }

  getELiterals(): EList<EEnumLiteral> {
    return this.literals;
  }

  /**
   * Preferred over `getELiterals().add(...)` directly, since it also wires
   * the literal's owning-EEnum backpointer (EEnumLiteral is not an
   * EObjectImpl, so BasicEList's generic containment wiring does not apply
   * to it - see the note in emodel-element-impl.ts).
   */
  addLiteral(literal: EEnumLiteral): void {
    this.literals.add(literal);
    (literal as unknown as { setEEnum(owner: EEnum | undefined): void }).setEEnum(this);
  }

  getEEnumLiteral(name: string): EEnumLiteral | undefined {
    return this.literals.find((l) => l.getName() === name);
  }

  getEEnumLiteralByValue(value: number): EEnumLiteral | undefined {
    return this.literals.find((l) => l.getValue() === value);
  }

  override isInstance(value: unknown): boolean {
    return typeof value === 'string' && this.getEEnumLiteral(value) !== undefined;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'eLiterals':
        return this.getELiterals();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      // Deliberately not delegated to the shared replaceListContents()
      // helper - each new literal needs addLiteral()'s backpointer wiring,
      // not a plain list insert.
      case 'eLiterals':
        this.literals.clear();
        for (const literal of value as Iterable<EEnumLiteral>) this.addLiteral(literal);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'eLiterals':
        return !this.literals.isEmpty();
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'eLiterals':
        this.literals.clear();
        return;
      default:
        super.eUnset(feature);
    }
  }

  /**
   * Cascades to every own literal, matching real EMF's EEnumImpl.freeze()
   * exactly - a real, previously-missed gap: EClassImpl and EPackageImpl
   * both got a freeze() override when freeze()/isFrozen() was added, but
   * EEnumImpl was missed, so an EEnum's literals never actually got
   * frozen even when the whole package was.
   */
  protected override freeze(): void {
    for (const literal of this.literals) {
      this.freezeChild(literal);
    }
    super.freeze();
  }
}
