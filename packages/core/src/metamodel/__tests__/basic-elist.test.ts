import { describe, expect, it } from 'vitest';
import { BasicEList } from '../../index.js';

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
});
