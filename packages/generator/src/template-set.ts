import type nunjucks from 'nunjucks';
import type { EPackage } from '@typemf/core';

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
   * Optional hook to reject a package before any template renders, by
   * returning a non-empty list of problems (rendered together into one
   * thrown error) - e.g. this set's own generated member names
   * colliding in a way it doesn't know how to resolve automatically.
   * Runs once, after ID assignment, before configureEnvironment/main.njk.
   */
  validate?(pkg: EPackage, options: Record<string, unknown>): string[];

  /**
   * Optional hook to register set-specific filters/globals (e.g. a
   * `tsType` filter mapping EDataType names to TypeScript type names) on
   * this set's own Nunjucks Environment, before `main.njk` renders. Only
   * this set's templates ever see these - a "java" set registering its
   * own `javaType` filter neither conflicts with nor is visible to this
   * one. Also receives the package being generated and the generation
   * options, for a set that needs them outside the templates themselves.
   */
  configureEnvironment?(env: nunjucks.Environment, context: { pkg: EPackage; options: Record<string, unknown> }): void;

  /**
   * Optional hook to transform a file's fully-rendered body before it's
   * recorded as output - called once per {% file %} block, right after
   * its body string is complete, before anything else sees it. The one
   * real use today: prepending a computed, deduplicated import header
   * that a set's own `useType()`-style mechanism collected while the
   * body rendered (see ImportCollector/typescript-template-set.ts) -
   * this is the only point in the pipeline where the whole body is
   * available as a string but nothing has been finalized yet, since
   * nunjucks renders top-to-bottom in one linear pass and there's no way
   * to "go back" and insert a header once the body below it has already
   * streamed out.
   */
  postProcessFile?(path: string, content: string, options: Record<string, unknown>): string;
}
