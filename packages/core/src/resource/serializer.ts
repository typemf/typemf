import { EObject } from '../metamodel/types/EObject.js';
import { Resource } from './resource.js';

/**
 * A pluggable persistence format. @typemf/json and @typemf/xmi each ship
 * one implementation and a matching ResourceFactory; a ResourceImpl is
 * constructed with whichever one applies, rather than Resource having a
 * format-specific subclass per format the way EMF's XMIResourceImpl does -
 * see the design note in the planning discussion for why this shape was
 * chosen over EMF's inheritance-based one.
 *
 * Byte-oriented for the same reason UriConverter is: text encoding is a
 * concern of the format, not of the generic Resource/ResourceSet plumbing.
 */
export interface EObjectSerializer {
  /**
   * `resource` gives the serializer everything it needs beyond the raw
   * bytes: the owning ResourceSet's package registry (to resolve
   * classifiers), a place to record parse errors/warnings rather than
   * throwing and losing context, and its own URI (for producing correctly
   * relative or absolute proxy references to objects in *other*
   * resources).
   */
  serialize(roots: EObject[], resource: Resource): Promise<Uint8Array>;
  deserialize(content: Uint8Array, resource: Resource): Promise<EObject[]>;

  /**
   * Every EPackage nsURI this content references - without needing any of them already
   * registered (unlike deserialize, which needs the registry to construct anything at all). Lets
   * a consumer (e.g. a reflective instance editor) check, before attempting a real load, whether
   * every needed package is already available, or some need resolving another way (e.g. prompting
   * for a .ecore file) - deserialize() itself has no way to report "I don't know which package(s)
   * this needs" gracefully, since it needs the registry to construct anything at all.
   *
   * A single document can genuinely reference more than one metamodel - any contained or
   * cross-referenced object can belong to a different package than the root - so this returns
   * every referenced nsURI, not just the root's own. Async because determining this may itself
   * require real parsing (e.g. @typemf/xmi's own implementation needs a real DOM parse).
   *
   * Deliberately does NOT guarantee every returned nsURI is genuinely used by some object in the
   * document, only that it's declared as available - a format is free to trade some precision for
   * simplicity here (e.g. @typemf/xmi's own implementation only scans the root element's own
   * namespace declarations, not the full tree, and returns everything declared there rather than
   * only namespaces some element's xsi:type actually uses) - over-reporting costs the consumer an
   * unnecessary registration prompt, not a silent failure, which is the safer direction to err in.
   */
  peekReferencedNsURIs(content: Uint8Array): Promise<string[]>;

  /**
   * Optional format-specific fragment addressing. A serializer that
   * leaves these undefined is understood to use @typemf/core's own
   * default grammar (resource/eobject-address.ts) - which is exactly what
   * ResourceSet.resolve() and any OTHER serializer writing a cross-
   * document reference INTO a resource owned by this one falls back to
   * when these aren't provided. @typemf/json never implements them, since
   * its grammar already IS the default; @typemf/xmi does, since it
   * targets EMF's own grammar instead. This is what lets a resource
   * written by one format correctly cross-reference an object living in a
   * resource written by a different one: whichever format owns the
   * TARGET decides how its own fragments look, regardless of which format
   * is doing the referencing.
   */
  computeFragment?(target: EObject, roots: EObject[]): string;
  resolveFragment?(fragment: string, roots: EObject[]): EObject | undefined;
}
