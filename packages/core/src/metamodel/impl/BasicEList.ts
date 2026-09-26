import { EList, EReference, EStructuralFeature } from "../types/index.js";
import { EObjectImpl } from "./index.js";

/**
 * Array-backed EList. When constructed with an owner + feature, add/remove
 * additionally maintain containment bookkeeping (eContainer /
 * eContainingFeature, including removal from a previous container's list)
 * and the feature's EOpposite as a side effect - this is what lets a plain
 * `someObject.getChildren().add(child)` call be enough to make
 * `child.eContainer() === someObject` true, without the caller having to
 * know anything about containment. The bookkeeping itself lives in
 * EObjectImpl.eDidAdd/eDidRemove.
 */
export class BasicEList<T> implements EList<T> {
  private readonly items: T[] = [];

  constructor(
    private readonly owner?: EObjectImpl,
    private readonly feature?: EStructuralFeature,
    initial?: Iterable<T>,
  ) {
    if (initial) {
      for (const item of initial) this.add(item);
    }
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  get(index: number): T {
    const item = this.items[index];
    if (item === undefined && (index < 0 || index >= this.items.length)) {
      throw new RangeError(
        `EList index ${index} out of bounds (size ${this.items.length})`,
      );
    }
    return item as T;
  }

  add(item: T): void {
    if (this.rejectsDuplicate(item)) return;
    this.items.push(item);
    this.onAdded(item);
  }

  addAt(index: number, item: T): void {
    if (this.rejectsDuplicate(item)) return;
    this.items.splice(index, 0, item);
    this.onAdded(item);
  }

  addAll(items: Iterable<T>): void {
    for (const item of items) this.add(item);
  }

  remove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index === -1) return false;
    this.items.splice(index, 1);
    this.onRemoved(item);
    return true;
  }

  removeAt(index: number): T {
    const [item] = this.items.splice(index, 1);
    if (item !== undefined) this.onRemoved(item);
    return item as T;
  }

  clear(): void {
    const removed = this.items.splice(0, this.items.length);
    for (const item of removed) this.onRemoved(item);
  }

  contains(item: T): boolean {
    return this.items.includes(item);
  }

  indexOf(item: T): number {
    return this.items.indexOf(item);
  }

  toArray(): T[] {
    return [...this.items];
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  every(predicate: (item: T) => boolean): boolean {
    return this.items.every(predicate);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  map<U>(fn: (item: T) => U): U[] {
    return this.items.map(fn);
  }

  forEach(fn: (item: T, index: number) => void): void {
    this.items.forEach(fn);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }

  /**
   * Internal - adds without containment/opposite side effects. Used by
   * EObjectImpl when this list is the *other* end of a change whose
   * bookkeeping is already being handled.
   */
  basicAdd(item: T): void {
    if (this.rejectsDuplicate(item)) return;
    this.items.push(item);
  }

  /** Internal - removes without containment/opposite side effects. */
  basicRemove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  /**
   * Reference lists are always unique (as in EMF): re-adding a member is a
   * no-op rather than a duplicate entry, which is also what keeps
   * inverse-add from double-inserting.
   */
  private rejectsDuplicate(item: T): boolean {
    return (
      !!this.feature && isReference(this.feature) && this.items.includes(item)
    );
  }

  private onAdded(item: T): void {
    if (this.owner && this.feature) this.owner.eDidAdd(this.feature, item);
  }

  private onRemoved(item: T): void {
    if (this.owner && this.feature) this.owner.eDidRemove(this.feature, item);
  }
}

function isReference(feature: EStructuralFeature): feature is EReference {
  return "isContainment" in feature;
}
