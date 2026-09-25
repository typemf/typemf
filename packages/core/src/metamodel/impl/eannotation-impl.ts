import { EAnnotation } from '../api/eannotation.js';
import { EClass } from '../api/eclass.js';
import { EModelElement } from '../api/emodel-element.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { EModelElementImpl, metamodelEClassNotBootstrapped } from './emodel-element-impl.js';

export class EAnnotationImpl extends EModelElementImpl implements EAnnotation {
  private source: string | undefined;
  private readonly details = new Map<string, string>();
  private owner: EModelElement | undefined;

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EAnnotationImpl');
  }

  getSource(): string | undefined {
    return this.source;
  }

  setSource(source: string): void {
    this.source = source;
  }

  getDetails(): Map<string, string> {
    return this.details;
  }

  getEModelElement(): EModelElement | undefined {
    return this.owner;
  }

  /** Internal - called by the owning EModelElementImpl when this is attached. */
  setEModelElement(owner: EModelElement | undefined): void {
    this.owner = owner;
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'source':
        return this.getSource();
      case 'details':
        return this.details;
      // eModelElement is transient/non-changeable in real EMF (maintained
      // as the inverse of eAnnotations, not independently settable) -
      // readable here, but see eSet below for why it's not settable.
      case 'eModelElement':
        return this.getEModelElement();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'source':
        this.setSource(value as string);
        return;
      case 'details': {
        this.details.clear();
        const entries = value instanceof Map ? value.entries() : (value as Iterable<[string, string]>);
        for (const [k, v] of entries) this.details.set(k, v);
        return;
      }
      // eModelElement: deliberately NOT handled here, matching real EMF -
      // a non-changeable feature simply has no generated eSet case at
      // all, so it falls through to the "unknown feature" error below,
      // same as real EMF's own generated code would for it.
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'source':
        return this.source !== undefined;
      case 'details':
        return this.details.size > 0;
      case 'eModelElement':
        return this.owner !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'source':
        this.source = undefined;
        return;
      case 'details':
        this.details.clear();
        return;
      default:
        super.eUnset(feature);
    }
  }
}
