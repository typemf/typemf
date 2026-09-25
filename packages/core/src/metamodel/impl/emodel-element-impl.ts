import { EAnnotation } from '../api/eannotation.js';
import { EClass } from '../api/eclass.js';
import { EList } from '../api/elist.js';
import { EModelElement } from '../api/emodel-element.js';
import { EObject } from '../api/eobject.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { BasicEList } from './basic-elist.js';

/**
 * Shared eClass() body for every metamodel-of-the-metamodel class
 * (EClassImpl, EAttributeImpl, EPackageImpl, ...). Reflecting over the
 * metamodel itself this way needs a bootstrapped, self-describing Ecore
 * package that this initial version doesn't build - a separate, larger
 * concern from eGet()/eSet() by-name dispatch (see below), which needs no
 * such bootstrap since the caller already supplies the feature by name.
 */
export function metamodelEClassNotBootstrapped(typeName: string): never {
  throw new Error(
    `${typeName}.eClass() requires the bootstrapped Ecore package, which is not built yet. ` +
      'Use the typed getters/instanceof checks instead of reflecting over metamodel elements themselves.'
  );
}

/**
 * Replaces the contents of a many-valued feature's live EList with
 * `newValue` - the generic form of what real EMF's own generated eSet
 * cases do for every list-typed feature (`getX().clear();
 * getX().addAll((Collection)newValue);`). Shared across every
 * EModelElementImpl subclass's own eSet() implementation rather than
 * repeated per class.
 */
export function replaceListContents<T>(list: EList<T>, newValue: unknown): void {
  list.clear();
  list.addAll(newValue as Iterable<T>);
}

/** Consistent error for a feature no class in the chain recognizes - the point where the super-call fallthrough terminates. */
export function unknownFeatureError(owner: object, feature: EStructuralFeature): Error {
  return new Error(
    `'${feature.getName()}' is not a feature of ${owner.constructor.name} or any of its supertypes.`
  );
}

/**
 * Abstract base for metamodel constructs (EClass, EAttribute, EPackage, ...).
 *
 * eGet()/eSet()/eIsSet()/eUnset() ARE real here, dispatching by the given
 * feature's NAME - each subclass handles only its own locally-declared
 * features and falls through to `super` for anything else, exactly
 * mirroring real EMF's own generated fallthrough chain (there,
 * `eDynamicGet` for an unrecognized featureID; here, `super.eGet()` for an
 * unrecognized name), just keyed by name rather than a numeric featureID -
 * these hand-written classes were never assigned featureIDs the way
 * generated code is (that only happens for classes @typemf/generator
 * actually produces), so name-based dispatch is the tractable equivalent.
 *
 * This does NOT mean eClass() is bootstrapped - eClass() on these classes
 * still throws (see metamodelEClassNotBootstrapped above), since it needs
 * a real, self-describing EClass metaobject to return, a materially larger
 * concern than by-name dispatch. A caller who already has a real
 * EStructuralFeature in hand (from another EClass's
 * getEStructuralFeatureByName(), say) can eGet()/eSet() on these classes
 * today; nothing here yet lets you ask "what EClass is this instance of"
 * and get a real answer back.
 */
export abstract class EModelElementImpl implements EModelElement {
  private readonly annotations = new BasicEList<EAnnotation>();
  private _eContainer: EObject | undefined;
  private _eContainingFeature: EStructuralFeature | undefined;
  private frozen = false;

  abstract eClass(): EClass;

  /**
   * Marks this element (and, via each concrete subclass's own override -
   * see EClassImpl, EPackageImpl - everything it contains) as no longer
   * intended to be mutated. Matches real EMF's own design precisely: a
   * queryable flag, not enforced in every setter. Real EMF's own
   * enforcement is a single `assert !isFrozen()` in one place
   * (eSetDirectResource) - a mechanism that is itself frequently inactive
   * in production Java (assertions are off by default unless -ea is
   * passed). Given that, invasively guarding every setter here would be
   * enforcing something more strictly than the system being ported
   * actually does. Protected, not public, matching real EMF: this is an
   * internal construction-lifecycle concern (called once, from within a
   * package's own init()), not a general external API.
   */
  protected freeze(): void {
    this.frozen = true;
  }

  protected isFrozen(): boolean {
    return this.frozen;
  }

  /** Freezes `child` if it is itself an EModelElementImpl - the same conditional cascade helper real EMF's EModelElementImpl.freeze(Object) provides for subclasses to iterate their own contained elements with. */
  protected freezeChild(child: unknown): void {
    if (child instanceof EModelElementImpl) {
      child.freeze();
    }
  }

  getEAnnotations(): EList<EAnnotation> {
    return this.annotations;
  }

  getEAnnotation(source: string): EAnnotation | undefined {
    return this.annotations.find((a) => a.getSource() === source);
  }

  eContainer(): EObject | undefined {
    return this._eContainer;
  }

  eContainingFeature(): EStructuralFeature | undefined {
    return this._eContainingFeature;
  }

  /** Internal - called by owning containers (EPackageImpl, EClassImpl, ...). */
  eBasicSetContainer(container: EObject | undefined, feature: EStructuralFeature | undefined): void {
    this._eContainer = container;
    this._eContainingFeature = feature;
  }

  eContents(): EList<EObject> {
    // Metamodel containment is hand-wired per concrete subclass (e.g.
    // EPackageImpl returns its eClassifiers); the generic default is empty
    // rather than reflective, per the class-level note above.
    return new BasicEList<EObject>();
  }

  eAllContents(): EObject[] {
    const result: EObject[] = [];
    for (const child of this.eContents()) {
      result.push(child);
      result.push(...child.eAllContents());
    }
    return result;
  }

  eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'eAnnotations':
        return this.getEAnnotations();
      default:
        throw unknownFeatureError(this, feature);
    }
  }

  eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'eAnnotations':
        replaceListContents(this.getEAnnotations(), value);
        return;
      default:
        throw unknownFeatureError(this, feature);
    }
  }

  eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'eAnnotations':
        return !this.getEAnnotations().isEmpty();
      default:
        throw unknownFeatureError(this, feature);
    }
  }

  eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'eAnnotations':
        this.getEAnnotations().clear();
        return;
      default:
        throw unknownFeatureError(this, feature);
    }
  }

  eIsProxy(): boolean {
    return false;
  }

  fullId(): string {
    const name = 'getName' in this ? (this as unknown as { getName(): string }).getName() : undefined;
    return `${this.constructor.name}_${name ?? 'unnamed'}`;
  }
}
