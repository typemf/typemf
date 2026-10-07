import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type nunjucks from 'nunjucks';
import { TemplateSet } from './template-set.js';
import { beginGeneration } from './generation-context.js';
import { importCollector, ImportLocation, locationOfPath } from './import-collector.js';
import {
  argList,
  beanGetterName,
  concreteEClassesOf,
  detailsEntries,
  runtimeAnnotations,
  docComment,
  eClassesOf,
  factoryClassName,
  findEClassByName,
  groupOperationsByName,
  isEClass,
  isEDataType,
  isEEnum,
  isEReference,
  isOptional,
  isClassifierDerived,
  isBookkeepingOperation,
  findUnnamedElements,
  findUnresolvedCollisions,
  metaclassAccessorCollision,
  metaclassAccessorCollisionTypeNames,
  optionalParamList,
  isPrimitiveValueType,
  jsString,
  mergedParamList,
  mergedReturnType,
  featureGetter,
  featureSetter,
  isReadOnlyFeature,
  needsImplOnlySetter,
  customBodyNeedsOwnField,
  operationBody,
  overloadDispatch,
  registerBodyImports,
  packageClassName,
  paramList,
  primitiveDefaultValue,
  referencedApiTypes,
  referencedOperationTypes,
  singleValuedFeatures,
  superType,
  superTypeChain,
  switchClassName,
  trivialDerivedFormula,
  tsFeatureType,
  tsOperationReturnType,
  tsOptionalScalarType,
  tsScalarType,
  typeGuardsClassName,
  ucfirst,
} from './typescript-filters.js';

// One level up from this file (src/ or, after build, dist/) lands at the
// package root either way, since both are direct children of it - see
// NOTES.md for why this resolves correctly whether running from source
// (tests) or from the built package.
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Records that the current file's body needs `name` from the given
 * location, returning `name` unchanged so it can be used inline exactly
 * where the type name would otherwise be written directly (e.g.
 * `{{ useImport("EAnnotation", "types", {foundational: true}) }} | undefined`).
 * The recording is read back and rendered into real import statements by
 * postProcessFile below, once this file's whole body is known.
 */
function useImport(name: string, location: ImportLocation, opts: { file?: string; foundational: boolean }): string {
  importCollector.add({ name, location, file: opts.file, foundational: opts.foundational });
  return name;
}

export const typescriptTemplateSet: TemplateSet = {
  name: 'typescript',
  baseFolder: join(packageRoot, 'templates', 'typescript'),
  validate(pkg): string[] {
    return [
      ...findUnnamedElements(pkg),
      ...findUnresolvedCollisions(pkg).map(
        (c) => `${c.classifierName}.${c.memberName}: name collision between ${c.sources.join(' and ')}`
      ),
    ];
  },
  configureEnvironment(env: nunjucks.Environment, { pkg, options }): void {
    // Runs once per generate() call, before anything renders: drop any
    // reference a type-text function recorded outside a real generation
    // (a unit test calling tsScalarType directly, say) so it can't leak
    // into the first generated file's header.
    importCollector.clear();
    beginGeneration(pkg, options);
    env.addGlobal('docComment', docComment);
    env.addGlobal('operationBody', operationBody);
    env.addGlobal('featureGetter', featureGetter);
    env.addGlobal('featureSetter', featureSetter);
    env.addGlobal('isReadOnlyFeature', isReadOnlyFeature);
    env.addGlobal('needsImplOnlySetter', needsImplOnlySetter);
    env.addGlobal('customBodyNeedsOwnField', customBodyNeedsOwnField);
    env.addGlobal('registerBodyImports', registerBodyImports);
    env.addGlobal('overloadDispatch', overloadDispatch);
    env.addGlobal('tsScalarType', tsScalarType);
    env.addGlobal('tsFeatureType', tsFeatureType);
    env.addGlobal('tsOperationReturnType', tsOperationReturnType);
    env.addGlobal('isOptional', isOptional);
    env.addGlobal('isEClass', isEClass);
    env.addGlobal('isEEnum', isEEnum);
    env.addGlobal('isEDataType', isEDataType);
    env.addGlobal('isEReference', isEReference);
    env.addGlobal('paramList', paramList);
    env.addGlobal('argList', argList);
    env.addGlobal('ucfirst', ucfirst);
    env.addGlobal('packageClassName', packageClassName);
    env.addGlobal('factoryClassName', factoryClassName);
    env.addGlobal('switchClassName', switchClassName);
    env.addGlobal('superType', superType);
    env.addGlobal('superTypeChain', superTypeChain);
    env.addGlobal('referencedApiTypes', referencedApiTypes);
    env.addGlobal('referencedOperationTypes', referencedOperationTypes);
    env.addGlobal('eClassesOf', eClassesOf);
    env.addGlobal('concreteEClassesOf', concreteEClassesOf);
    env.addGlobal('singleValuedFeatures', singleValuedFeatures);
    env.addGlobal('trivialDerivedFormula', trivialDerivedFormula);
    env.addGlobal('findEClassByName', findEClassByName);
    env.addGlobal('jsString', jsString);
    env.addGlobal('detailsEntries', detailsEntries);
    env.addGlobal('runtimeAnnotations', runtimeAnnotations);
    env.addGlobal('beanGetterName', beanGetterName);
    env.addGlobal('isPrimitiveValueType', isPrimitiveValueType);
    env.addGlobal('primitiveDefaultValue', primitiveDefaultValue);
    env.addGlobal('tsOptionalScalarType', tsOptionalScalarType);
    env.addGlobal('groupOperationsByName', groupOperationsByName);
    env.addGlobal('mergedParamList', mergedParamList);
    env.addGlobal('mergedReturnType', mergedReturnType);
    env.addGlobal('isClassifierDerived', isClassifierDerived);
    env.addGlobal('isBookkeepingOperation', isBookkeepingOperation);
    env.addGlobal('metaclassAccessorCollision', metaclassAccessorCollision);
    env.addGlobal('metaclassAccessorCollisionTypeNames', metaclassAccessorCollisionTypeNames);
    env.addGlobal('optionalParamList', optionalParamList);
    env.addGlobal('typeGuardsClassName', typeGuardsClassName);
    env.addGlobal('useImport', useImport);
  },
  postProcessFile(path, content, options): string {
    const header = importCollector.render(locationOfPath(path), options);
    importCollector.clear();
    return header ? `${header}\n\n${content}` : content;
  },
};
