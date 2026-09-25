import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type nunjucks from 'nunjucks';
import { TemplateSet } from './template-set.js';
import {
  argList,
  concreteEClassesOf,
  detailsEntries,
  docComment,
  eClassesOf,
  factoryClassName,
  findEClassByName,
  isEClass,
  isEDataType,
  isEEnum,
  isEReference,
  isOptional,
  jsString,
  operationBody,
  packageClassName,
  paramList,
  referencedApiTypes,
  singleValuedFeatures,
  superType,
  superTypeChain,
  switchClassName,
  trivialDerivedFormula,
  tsFeatureType,
  tsScalarType,
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
  },
};
