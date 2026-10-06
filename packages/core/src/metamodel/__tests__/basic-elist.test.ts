import { describe, expect, it } from 'vitest';
import { BasicEList, createInstanceOf, Notification } from '../../index.js';
import { buildSampleMetamodel } from './sample-metamodel.js';

describe('BasicEList', () => {
  it('supports basic add/get/size/contains/indexOf', () => {
    const list = new BasicEList<string>();
    expect(list.isEmpty()).toBe(true);

    list.add('a');
    list.add('b');
    list.add('c');

    expect(list.size()).toBe(3);
    expect(list.get(1)).toBe('b');
    expect(list.contains('c')).toBe(true);
    expect(list.indexOf('c')).toBe(2);
    expect(list.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('supports addAt, remove, removeAt and clear', () => {
    const list = new BasicEList<number>();
    list.addAll([1, 2, 4]);
    list.addAt(2, 3);
    expect(list.toArray()).toEqual([1, 2, 3, 4]);

    expect(list.remove(2)).toBe(true);
    expect(list.remove(99)).toBe(false);
    expect(list.toArray()).toEqual([1, 3, 4]);

    expect(list.removeAt(0)).toBe(1);
    expect(list.toArray()).toEqual([3, 4]);

    list.clear();
    expect(list.isEmpty()).toBe(true);
  });

  it('is iterable and supports the functional helpers', () => {
    const list = new BasicEList<number>();
    list.addAll([1, 2, 3, 4, 5]);

    expect([...list]).toEqual([1, 2, 3, 4, 5]);
    expect(list.find((n) => n > 3)).toBe(4);
    expect(list.some((n) => n > 10)).toBe(false);
    expect(list.every((n) => n > 0)).toBe(true);
    expect(list.filter((n) => n % 2 === 0)).toEqual([2, 4]);
    expect(list.map((n) => n * 2)).toEqual([2, 4, 6, 8, 10]);
  });

  it('throws a RangeError for an out-of-bounds get()', () => {
    const list = new BasicEList<number>();
    list.add(1);
    expect(() => list.get(5)).toThrow(RangeError);
  });

  describe('move() - CORE-12', () => {
    it('reorders elements, returns the moved one, and leaves the rest shifted correctly', () => {
      const list = new BasicEList<string>();
      list.addAll(['a', 'b', 'c', 'd']);

      expect(list.move(0, 2)).toBe('a');
      expect(list.toArray()).toEqual(['b', 'c', 'a', 'd']);

      expect(list.move(2, 0)).toBe('a');
      expect(list.toArray()).toEqual(['a', 'b', 'c', 'd']);
    });

    it('throws a RangeError for an out-of-bounds fromIndex', () => {
      const list = new BasicEList<number>();
      list.add(1);
      expect(() => list.move(5, 0)).toThrow(RangeError);
    });

    it('fires a MOVE notification (not REMOVE+ADD) on an owned list, carrying the old and new position', () => {
      const { libraryClass, bookClass, booksRef } = buildSampleMetamodel();
      const library = createInstanceOf(libraryClass);
      const book1 = createInstanceOf(bookClass);
      const book2 = createInstanceOf(bookClass);
      const book3 = createInstanceOf(bookClass);
      const books = library.eGet(booksRef) as BasicEList<unknown>;
      books.add(book1);
      books.add(book2);
      books.add(book3);

      const notifications: Notification[] = [];
      library.onDidChange((n) => notifications.push(n));

      books.move(0, 2);

      expect(books.toArray()).toEqual([book2, book3, book1]);
      expect(notifications).toHaveLength(1);
      const [notification] = notifications;
      expect(notification!.eventType).toBe('MOVE');
      expect(notification!.feature).toBe(booksRef);
      expect(notification!.oldValue).toBe(0); // old position
      expect(notification!.newValue).toBe(book1); // the moved element
      expect(notification!.position).toBe(2); // new position
    });
  });
});
