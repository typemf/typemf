import { EClass, EClassifier, EPackage } from '@typemf/core';

/**
 * Assigns classifierID/featureID freshly, in declaration order, mutating
 * the EClass/EStructuralFeature objects directly - matches real EMF's own
 * behaviour (these are recomputed-every-build implementation details of
 * the generated code, not values meant to persist anywhere). See the
 * design discussion: our wire formats (json/xmi) address by name, never by
 * numeric ID, so this never threatens file compatibility - the only
 * observable effect is generated-code diff noise across unrelated
 * metamodel edits, a cosmetic cost judged acceptable given it matches
 * upstream EMF precedent.
 *
 * featureID is assigned over getEAllStructuralFeatures() (inherited-then-
 * own, matching real EMF), NOT a per-class restart at 0 - a subclass's
 * generated eGet/eSet needs one flat ID space covering both its inherited
 * and its own features (a generated subclass typically delegates any
 * featureID it doesn't recognize to `super.eGet()`/`super.eSet()`), so an
 * inherited feature and a subclass's own new feature must never collide.
 * Reassigning via any subclass's getEAllStructuralFeatures() is safe to
 * repeat for the same feature across multiple classes in the hierarchy -
 * the computed index is the same regardless of which class's perspective
 * computes it, since supertype features always come first in the same
 * relative order.
 */
export function assignFreshIds(pkg: EPackage): void {
  let classifierId = 0;
  for (const classifier of pkg.getEClassifiers()) {
    classifier.setClassifierID(classifierId++);
  }
  for (const classifier of pkg.getEClassifiers()) {
    if (!isEClass(classifier)) continue;
    classifier.recomputeAllLists();
    classifier.getEAllStructuralFeatures().forEach((feature, index) => feature.setFeatureID(index));
  }
}

function isEClass(classifier: EClassifier): classifier is EClass {
  return 'getEStructuralFeatures' in classifier;
}
