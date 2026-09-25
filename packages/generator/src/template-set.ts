import type nunjucks from 'nunjucks';

/**
 * An isolated, self-contained template contribution - the generator's
 * extension point. `baseFolder` contains a `main.njk` entry point and is
 * ALSO the private include/import resolution root for that set: two
 * different sets can each have their own e.g. `eclass.ts.njk` inside their
 * own folder and never know the other exists. There is no cross-set
 * override or search-path merging - isolation is structural, not a policy
 * decision to make at render time.
 *
 * `main.njk` is invoked exactly once per generation run, over the whole
 * EPackage - it is the template-set author's own job to iterate whatever
 * they need to (classifiers, features, ...) and call {% file %} as many
 * times as they want. The generator's own TypeScript orchestration does
 * not impose a fixed per-class loop on every language.
 */
export interface TemplateSet {
  name: string;
  baseFolder: string;

  /**
   * Optional hook to register set-specific filters/globals (e.g. a
   * `tsType` filter mapping EDataType names to TypeScript type names) on
   * this set's own Nunjucks Environment, before `main.njk` renders. Only
   * this set's templates ever see these - a "java" set registering its
   * own `javaType` filter neither conflicts with nor is visible to this
   * one.
   */
  configureEnvironment?(env: nunjucks.Environment): void;
}
