import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type nunjucks from 'nunjucks';
import { TemplateSet } from './template-set.js';
import {
  argList,
  beanGetterName,
  concreteEClassesOf,
  coreImportLine,
  coreImportSpecifier,
  detailsEntries,
  docComment,
  eClassesOf,
  excludeCollidingCoreNames,
  factoryClassName,
  findEClassByName,
  groupOperationsByName,
  isEClass,
  isEDataType,
  isEEnum,
  isEReference,
  isOptional,
  isPrimitiveValueType,
  jsString,
  mergedParamList,
  mergedReturnType,
  operationBody,
  packageClassName,
  paramList,
  primitiveDefaultValue,
  referencedApiTypes,
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

export const typescriptTemplateSet: TemplateSet = {
  name: 'typescript',
  baseFolder: join(packageRoot, 'templates', 'typescript'),
  configureEnvironment(env: nunjucks.Environment): void {
    env.addGlobal('docComment', docComment);
    env.addGlobal('operationBody', (op: Parameters<typeof operationBody>[0]) => operationBody(op, 'typescript'));
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
    env.addGlobal('eClassesOf', eClassesOf);
    env.addGlobal('concreteEClassesOf', concreteEClassesOf);
    env.addGlobal('singleValuedFeatures', singleValuedFeatures);
    env.addGlobal('trivialDerivedFormula', trivialDerivedFormula);
    env.addGlobal('findEClassByName', findEClassByName);
    env.addGlobal('jsString', jsString);
    env.addGlobal('detailsEntries', detailsEntries);
    env.addGlobal('beanGetterName', beanGetterName);
    env.addGlobal('isPrimitiveValueType', isPrimitiveValueType);
    env.addGlobal('primitiveDefaultValue', primitiveDefaultValue);
    env.addGlobal('tsOptionalScalarType', tsOptionalScalarType);
    env.addGlobal('groupOperationsByName', groupOperationsByName);
    env.addGlobal('mergedParamList', mergedParamList);
    env.addGlobal('mergedReturnType', mergedReturnType);
    env.addGlobal('coreImportSpecifier', coreImportSpecifier);
    env.addGlobal('excludeCollidingCoreNames', excludeCollidingCoreNames);
    env.addGlobal('coreImportLine', coreImportLine);
    env.addGlobal('typeGuardsClassName', typeGuardsClassName);
  },
};
