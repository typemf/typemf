import { EObject } from "../metamodel/types/EObject.js";
import { Resource } from "./resource.js";

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
