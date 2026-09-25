import { EAttribute } from '../api/eattribute.js';
import { EClass } from '../api/eclass.js';
import { EList } from '../api/elist.js';
import { EObject } from '../api/eobject.js';
import { EOperation } from '../api/eoperation.js';
import { EReference } from '../api/ereference.js';
import { EStructuralFeature } from '../api/estructural-feature.js';
import { BasicEList } from './basic-elist.js';
import { EClassifierImpl } from './eclassifier-impl.js';
import { metamodelEClassNotBootstrapped, replaceListContents } from './emodel-element-impl.js';

export class EClassImpl extends EClassifierImpl implements EClass {
  private readonly superTypes = new BasicEList<EClass>();
  private readonly structuralFeatures = new BasicEList<EStructuralFeature>();
  private readonly operations = new BasicEList<EOperation>();
  private abstractFlag = false;
  private interfaceFlag = false;

  // Caches, populated by recomputeAllLists(); undefined means "stale/never
  // computed", which getEAllStructuralFeatures() etc. treat as "compute now".
  private allSuperTypesCache: EClass[] | undefined;
  private allFeaturesCache: EStructuralFeature[] | undefined;

  eClass(): EClass {
    metamodelEClassNotBootstrapped('EClassImpl');
  }

  getESuperTypes(): EList<EClass> {
    return this.superTypes;
  }

  getEStructuralFeatures(): EList<EStructuralFeature> {
    return this.structuralFeatures;
  }

  getEAttributes(): EList<EAttribute> {
    const result = new BasicEList<EAttribute>();
    for (const f of this.structuralFeatures) {
      if (isEAttribute(f)) result.add(f);
    }
    return result;
  }

  getEReferences(): EList<EReference> {
    const result = new BasicEList<EReference>();
    for (const f of this.structuralFeatures) {
      if (isEReference(f)) result.add(f);
    }
    return result;
  }

  getEOperations(): EList<EOperation> {
    return this.operations;
  }

  getEAllSuperTypes(): EClass[] {
    if (!this.allSuperTypesCache) this.recomputeAllLists();
    return this.allSuperTypesCache as EClass[];
  }

  getEAllStructuralFeatures(): EStructuralFeature[] {
    if (!this.allFeaturesCache) this.recomputeAllLists();
    return this.allFeaturesCache as EStructuralFeature[];
  }

  getEAllAttributes(): EAttribute[] {
    return this.getEAllStructuralFeatures().filter(isEAttribute);
  }

  getEAllReferences(): EReference[] {
    return this.getEAllStructuralFeatures().filter(isEReference);
  }

  getEAllContainments(): EReference[] {
    return this.getEAllReferences().filter((r) => r.isContainment());
  }

  getEAllOperations(): EOperation[] {
    const inherited = this.getEAllSuperTypes().flatMap((s) => s.getEOperations().toArray());
    return [...inherited, ...this.operations];
  }

  getEStructuralFeature(featureID: number): EStructuralFeature | undefined {
    return this.getEAllStructuralFeatures().find((f) => f.getFeatureID() === featureID);
  }

  getEStructuralFeatureByName(name: string): EStructuralFeature | undefined {
    return this.getEAllStructuralFeatures().find((f) => f.getName() === name);
  }

  /** The single EAttribute marked isID() among this class's own+inherited attributes, if any - real EMF's own eIDAttribute, added here (previously missing entirely, not just undispatched) since getEAllAttributes() already made it a trivial, correct addition. */
  getEIDAttribute(): EAttribute | undefined {
    return this.getEAllAttributes().find((a) => a.isID());
  }

  isAbstract(): boolean {
    return this.abstractFlag;
  }

  setAbstract(isAbstract: boolean): void {
    this.abstractFlag = isAbstract;
  }

  isInterface(): boolean {
    return this.interfaceFlag;
  }

  setInterface(isInterface: boolean): void {
    this.interfaceFlag = isInterface;
  }

  isSuperTypeOf(other: EClass): boolean {
    if (other === this) return true;
    return other.getESuperTypes().some((s) => this.isSuperTypeOf(s));
  }

  isInstance(value: unknown): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as EObject).eClass === 'function' &&
      this.isSuperTypeOf((value as EObject).eClass())
    );
  }

  recomputeAllLists(): void {
    const seen = new Set<EClass>();
    const allSuperTypes: EClass[] = [];
    const collect = (c: EClass) => {
      for (const s of c.getESuperTypes()) {
        if (!seen.has(s)) {
          seen.add(s);
          collect(s);
          allSuperTypes.push(s);
        }
      }
    };
    collect(this);
    this.allSuperTypesCache = allSuperTypes;

    const inheritedFeatures = allSuperTypes.flatMap((s) => s.getEStructuralFeatures().toArray());
    this.allFeaturesCache = [...inheritedFeatures, ...this.structuralFeatures];
  }

  createInstance(): EObject {
    const pkg = this.getEPackage();
    const factory = pkg?.getEFactoryInstance();
    if (!factory) {
      throw new Error(
        `Cannot create an instance of '${this.getName()}': its EPackage has no EFactoryInstance registered. ` +
          'Generated packages register one at import time; a purely parsed .ecore package needs setEFactoryInstance(new DynamicEFactoryImpl()) called on it once, or EcoreParser to have done so automatically.'
      );
    }
    return factory.create(this);
  }

  /** Cascades to every own structural feature, matching real EMF's EClassImpl.freeze() exactly (operations too, once they have a real runtime representation here - see NOTES.md's tracked gap). */
  protected override freeze(): void {
    for (const feature of this.getEStructuralFeatures()) {
      this.freezeChild(feature);
    }
    super.freeze();
  }

  override eGet(feature: EStructuralFeature): unknown {
    switch (feature.getName()) {
      case 'abstract':
        return this.isAbstract();
      case 'interface':
        return this.isInterface();
      case 'eSuperTypes':
        return this.getESuperTypes();
      case 'eStructuralFeatures':
        return this.getEStructuralFeatures();
      case 'eOperations':
        return this.getEOperations();
      // Every one of these is a REAL, working traversal already (not a
      // stub) - getEAllSuperTypes()/getEAllStructuralFeatures() etc. are
      // genuine methods on this class, unlike the generator's generated
      // code, which deliberately left the equivalent unimplemented (see
      // the generator's own NOTES.md). No eSet case for any of these -
      // all derived, matching real EMF exactly.
      case 'eAllSuperTypes':
        return this.getEAllSuperTypes();
      case 'eAllStructuralFeatures':
        return this.getEAllStructuralFeatures();
      case 'eAllAttributes':
        return this.getEAllAttributes();
      case 'eAllReferences':
        return this.getEAllReferences();
      case 'eAttributes':
        return this.getEAttributes();
      case 'eReferences':
        return this.getEReferences();
      case 'eAllContainments':
        return this.getEAllContainments();
      case 'eAllOperations':
        return this.getEAllOperations();
      case 'eIDAttribute':
        return this.getEIDAttribute();
      default:
        return super.eGet(feature);
    }
  }

  override eSet(feature: EStructuralFeature, value: unknown): void {
    switch (feature.getName()) {
      case 'abstract':
        this.setAbstract(value as boolean);
        return;
      case 'interface':
        this.setInterface(value as boolean);
        return;
      case 'eSuperTypes':
        replaceListContents(this.superTypes, value);
        return;
      case 'eStructuralFeatures':
        replaceListContents(this.structuralFeatures, value);
        return;
      case 'eOperations':
        replaceListContents(this.operations, value);
        return;
      default:
        super.eSet(feature, value);
    }
  }

  override eIsSet(feature: EStructuralFeature): boolean {
    switch (feature.getName()) {
      case 'abstract':
        return this.abstractFlag !== false;
      case 'interface':
        return this.interfaceFlag !== false;
      case 'eSuperTypes':
        return !this.superTypes.isEmpty();
      case 'eStructuralFeatures':
        return !this.structuralFeatures.isEmpty();
      case 'eOperations':
        return !this.operations.isEmpty();
      case 'eAllSuperTypes':
      case 'eAllStructuralFeatures':
      case 'eAllAttributes':
      case 'eAllReferences':
      case 'eAttributes':
      case 'eReferences':
      case 'eAllContainments':
      case 'eAllOperations':
        return true;
      case 'eIDAttribute':
        return this.getEIDAttribute() !== undefined;
      default:
        return super.eIsSet(feature);
    }
  }

  override eUnset(feature: EStructuralFeature): void {
    switch (feature.getName()) {
      case 'abstract':
        this.abstractFlag = false;
        return;
      case 'interface':
        this.interfaceFlag = false;
        return;
      case 'eSuperTypes':
        this.superTypes.clear();
        return;
      case 'eStructuralFeatures':
        this.structuralFeatures.clear();
        return;
      case 'eOperations':
        this.operations.clear();
        return;
      default:
        super.eUnset(feature);
    }
  }
}

function isEAttribute(f: EStructuralFeature): f is EAttribute {
  return 'isID' in f;
}

function isEReference(f: EStructuralFeature): f is EReference {
  return 'isContainment' in f;
}
