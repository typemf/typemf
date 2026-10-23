import { typescriptTemplateSet } from '@typemf/generator';
import { describe, expect, it } from 'vitest';
import { isEmptyValue, isSupported, renameKey, Schema, withEntry } from '../../generator-editor/form-schema.js';

describe('isSupported', () => {
  it('supports the options schema of the typescript template set', () => {
    expect(isSupported(typescriptTemplateSet.optionsSchema as Schema)).toBe(true);
  });

  it('does not support schemas without a type, or with unions', () => {
    expect(isSupported({})).toBe(false);
    expect(isSupported({ type: 'object', properties: { a: { oneOf: [{ type: 'string' }] } as Schema } })).toBe(false);
    expect(isSupported(undefined)).toBe(false);
  });

  it('supports arrays of supported items and maps of supported values', () => {
    expect(isSupported({ type: 'array', items: { type: 'string' } })).toBe(true);
    expect(isSupported({ type: 'object', additionalProperties: { type: 'number' } })).toBe(true);
    expect(isSupported({ type: 'object', additionalProperties: true })).toBe(false);
  });
});

describe('withEntry', () => {
  it('sets a value', () => {
    expect(withEntry({ a: 1 }, 'b', 2)).toEqual({ a: 1, b: 2 });
  });

  it('removes an entry whose value is undefined or empty', () => {
    expect(withEntry({ a: 1, b: 2 }, 'b', undefined)).toEqual({ a: 1 });
    expect(withEntry({ a: 1, b: { x: 1 } }, 'b', {})).toEqual({ a: 1 });
    expect(withEntry({ a: 1, b: [1] }, 'b', [])).toEqual({ a: 1 });
    expect(withEntry({ a: 1, b: 'x' }, 'b', '')).toEqual({ a: 1 });
  });

  it('keeps false and 0', () => {
    expect(withEntry({}, 'a', false)).toEqual({ a: false });
    expect(withEntry({}, 'a', 0)).toEqual({ a: 0 });
  });
});

describe('isEmptyValue', () => {
  it('is true for undefined, empty text, lists and objects', () => {
    expect([undefined, '', [], {}].map(isEmptyValue)).toEqual([true, true, true, true]);
    expect([0, false, 'a', [1], { a: 1 }].map(isEmptyValue)).toEqual([false, false, false, false, false]);
  });
});

describe('renameKey', () => {
  it('renames in place', () => {
    expect(Object.keys(renameKey({ a: 1, b: 2, c: 3 }, 'b', 'x'))).toEqual(['a', 'x', 'c']);
  });
});
