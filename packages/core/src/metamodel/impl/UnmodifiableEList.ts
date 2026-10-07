import { BasicEList } from './BasicEList.js';

/**
 * A list that cannot be changed, as EMF's `EcoreEList.UnmodifiableEList`. Returned for features
 * whose value is computed, such as `EClass.getEAllStructuralFeatures()`.
 */
export class UnmodifiableEList<T> extends BasicEList<T> {
  private sealed = false;

  constructor(items: Iterable<T>) {
    super(undefined, undefined, items);
    this.sealed = true;
  }

  /** @throws Error always. */
  override add(item: T): void {
    this.rejectChange();
    super.add(item);
  }

  /** @throws Error always. */
  override addAt(index: number, item: T): void {
    this.rejectChange();
    super.addAt(index, item);
  }

  /** @throws Error always. */
  override addAll(items: Iterable<T>): void {
    this.rejectChange();
    super.addAll(items);
  }

  /** @throws Error always. */
  override remove(item: T): boolean {
    this.rejectChange();
    return super.remove(item);
  }

  /** @throws Error always. */
  override removeAt(index: number): T {
    this.rejectChange();
    return super.removeAt(index);
  }

  /** @throws Error always. */
  override clear(): void {
    this.rejectChange();
    super.clear();
  }

  /** @throws Error always. */
  override move(fromIndex: number, toIndex: number): T {
    this.rejectChange();
    return super.move(fromIndex, toIndex);
  }

  override basicAdd(item: T): void {
    this.rejectChange();
    super.basicAdd(item);
  }

  override basicRemove(item: T): boolean {
    this.rejectChange();
    return super.basicRemove(item);
  }

  private rejectChange(): void {
    if (this.sealed) throw new Error('This list is computed and cannot be modified.');
  }
}
