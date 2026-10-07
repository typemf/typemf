import { EList } from '../types/EList.js';
import { EObject } from '../types/EObject.js';
import { EReference } from '../types/EReference.js';
import { EStructuralFeature } from '../types/EStructuralFeature.js';
import { EObjectImpl } from './EObjectImpl.js';

/**
 * An array-backed {@link EList}. Constructed with an owner and a feature, it is that feature's
 * value: adding and removing elements updates containers and opposite references (see
 * `EObjectImpl.eDidAdd`/`eDidRemove`) and notifies the owner's listeners.
 */
export class BasicEList<T> implements EList<T> {
  private readonly items: T[] = [];

  constructor(
    private readonly owner?: EObjectImpl,
    private readonly feature?: EStructuralFeature,
    initial?: Iterable<T>
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
      throw new RangeError(`EList index ${index} out of bounds (size ${this.items.length})`);
    }
    return item as T;
  }

  add(item: T): void {
    if (this.rejectsDuplicate(item)) return;
    this.items.push(item);
    this.onAdded(item, this.items.length - 1);
  }

  addAt(index: number, item: T): void {
    if (this.rejectsDuplicate(item)) return;
    this.items.splice(index, 0, item);
    this.onAdded(item, index);
  }

  addAll(items: Iterable<T>): void {
    for (const item of items) this.add(item);
  }

  remove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index === -1) return false;
    this.items.splice(index, 1);
    this.onRemoved(item, index);
    return true;
  }

  removeAt(index: number): T {
    const [item] = this.items.splice(index, 1);
    if (item !== undefined) this.onRemoved(item, index);
    return item as T;
  }

  clear(): void {
    const removed = this.items.splice(0, this.items.length);
    // Each removal reported at position 0 - after each splice, every remaining item has already
    // shifted down by one, so the first remaining item is always the next one to go.
    for (const item of removed) this.onRemoved(item, 0);
  }

  move(fromIndex: number, toIndex: number): T {
    const item = this.get(fromIndex); // throws RangeError for an out-of-bounds fromIndex
    this.items.splice(fromIndex, 1);
    this.items.splice(toIndex, 0, item);
    this.onMoved(item, fromIndex, toIndex);
    return item;
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

  /** Internal. Adds without containment, opposite or notification side effects. */
  basicAdd(item: T): void {
    if (this.rejectsDuplicate(item)) return;
    this.items.push(item);
  }

  /** Internal. Removes without containment, opposite or notification side effects. */
  basicRemove(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  /** Reference lists are unique, as in EMF: adding an element already present does nothing. */
  private rejectsDuplicate(item: T): boolean {
    return !!this.feature && isReference(this.feature) && this.items.includes(item);
  }

  private onAdded(item: T, position: number): void {
    if (!this.owner) return;
    this.owner.eDidAdd(this.feature, item);
    if (this.feature) {
      this.owner.eNotify({
        eventType: 'ADD',
        notifier: this.owner,
        feature: this.feature,
        oldValue: undefined,
        newValue: item,
        position,
        wasSet: true,
      });
    }
  }

  private onRemoved(item: T, position: number): void {
    if (!this.owner) return;
    this.owner.eDidRemove(this.feature, item);
    if (this.feature) {
      this.owner.eNotify({
        eventType: 'REMOVE',
        notifier: this.owner,
        feature: this.feature,
        oldValue: item,
        newValue: undefined,
        position,
        wasSet: true,
      });
    }
  }

  /**
   * Notifies a `MOVE`; the element stays in the list, so containers and opposites are unchanged.
   */
  private onMoved(item: T, fromIndex: number, toIndex: number): void {
    if (!this.owner || !this.feature) return;
    this.owner.eNotify({
      eventType: 'MOVE',
      notifier: this.owner,
      feature: this.feature,
      oldValue: fromIndex,
      newValue: item,
      position: toIndex,
      wasSet: true,
    });
  }
}

function isReference(feature: EStructuralFeature): feature is EReference {
  return 'isContainment' in feature;
}

// Re-exported so callers can type-annotate against the interface without a
// second import.
export type { EObject };
