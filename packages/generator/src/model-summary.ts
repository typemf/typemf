import {
  EClassifier,
  EcorePackageImpl,
  EPackage,
  EStructuralFeature,
  isEClass,
  isEDataType,
  isEEnum,
} from '@typemf/core';

/** What the options `package-imports` and `type-imports` of the typescript template set are about. */
export interface ModelSummary {
  name: string;
  nsURI: string;
  /** The nsURIs of the other packages the model refers to, except Ecore. */
  referencedPackages: string[];
  /** The data types the model declares or uses, as `<nsURI>#<name>` - the keys of `type-imports`. Enums are left out. */
  dataTypes: string[];
}

export function summarizeModel(pkg: EPackage): ModelSummary {
  const ecoreNsURI = EcorePackageImpl.eINSTANCE.getNsURI();
  const referencedPackages = new Set<string>();
  const dataTypes = new Set<string>();

  const isInside = (classifier: EClassifier): boolean => {
    for (let owner = classifier.getEPackage(); owner; owner = owner.getESuperPackage()) {
      if (owner === pkg) return true;
    }
    return false;
  };

  const note = (classifier: EClassifier | undefined): void => {
    if (!classifier) return;
    const nsURI = classifier.getEPackage()?.getNsURI();
    if (!nsURI) return;
    if (!isInside(classifier) && nsURI !== ecoreNsURI) referencedPackages.add(nsURI);
    if (isEDataType(classifier) && !isEEnum(classifier)) dataTypes.add(`${nsURI}#${classifier.getName()}`);
  };

  const visit = (current: EPackage): void => {
    for (const classifier of current.getEClassifiers()) {
      note(classifier);
      if (!isEClass(classifier)) continue;
      for (const superType of classifier.getESuperTypes()) note(superType);
      const features: Iterable<EStructuralFeature> = classifier.getEStructuralFeatures();
      for (const feature of features) note(feature.getEType());
      for (const operation of classifier.getEOperations()) {
        note(operation.getEType());
        for (const parameter of operation.getEParameters()) note(parameter.getEType());
      }
    }
    for (const sub of current.getESubpackages()) visit(sub);
  };
  visit(pkg);

  return {
    name: pkg.getName() ?? '',
    nsURI: pkg.getNsURI() ?? '',
    referencedPackages: [...referencedPackages].sort(),
    dataTypes: [...dataTypes].sort(),
  };
}
