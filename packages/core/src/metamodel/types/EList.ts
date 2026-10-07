/**
 * An ordered collection, used for every many-valued feature in the metamodel
 * (EPackage.eClassifiers, EClass.eStructuralFeatures, an EReference whose
 * upperBound is > 1, etc). Implementations may be "live" - i.e. wired to an
 * owning EObject and EStructuralFeature so that add/remove maintain
 * containment and opposite bookkeeping as a side effect.
 */
export interface EList<T> extends Iterable<T> {
  /** Number of elements. */
  size(): number;

  /** Whether the list has no elements. */
  isEmpty(): boolean;

  /**
   * The element at `index`.
   *
   * @throws RangeError if `index` is out of bounds.
   */
  get(index: number): T;

  /**
   * Appends `item`. On a list backing a reference, adding an element that
   * is already present is a no-op (reference lists are unique).
   */
  add(item: T): void;

  /** Inserts `item` at `index`, shifting later elements. Same uniqueness rule as add(). */
  addAt(index: number, item: T): void;

  /** Appends every element of `items`, in order, as if by add(). */
  addAll(items: Iterable<T>): void;

  /** Removes the first occurrence of `item`. Returns whether it was present. */
  remove(item: T): boolean;

  /** Removes and returns the element at `index`. */
  removeAt(index: number): T;

  /** Removes every element, with the same side effects as removing each one. */
  clear(): void;

  /**
   * Moves the element at `fromIndex` to `toIndex`, shifting the elements between them. Returns
   * the moved element. A live list fires a single MOVE notification, not a REMOVE followed by an
   * ADD - the element never actually left the list, just changed position.
   *
   * @throws RangeError if `fromIndex` is out of bounds.
   */
  move(fromIndex: number, toIndex: number): T;

  /** Whether `item` is in the list (compared with `===`). */
  contains(item: T): boolean;

  /** Index of the first occurrence of `item`, or -1 if absent. */
  indexOf(item: T): number;

  /** A copy of the elements as a plain array. Changing it doesn't affect the list. */
  toArray(): T[];

  /** The first element matching `predicate`, like Array.prototype.find. */
  find(predicate: (item: T) => boolean): T | undefined;

  /** Whether any element matches `predicate`, like Array.prototype.some. */
  some(predicate: (item: T) => boolean): boolean;

  /** Whether every element matches `predicate`, like Array.prototype.every. */
  every(predicate: (item: T) => boolean): boolean;

  /** The matching elements as a new plain array, like Array.prototype.filter. */
  filter(predicate: (item: T) => boolean): T[];

  /** The mapped elements as a new plain array, like Array.prototype.map. */
  map<U>(fn: (item: T) => U): U[];

  /** Calls `fn` for each element in order, like Array.prototype.forEach. */
  forEach(fn: (item: T, index: number) => void): void;
}
