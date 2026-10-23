import { describe, expect, it } from 'vitest';
import { formatConfig, parseConfigText } from '../../generator-editor/config-text.js';

describe('parseConfigText', () => {
  it('parses a JSON object', () => {
    expect(parseConfigText('{"ecoreFile": "./m.ecore"}')).toEqual({ config: { ecoreFile: './m.ecore' } });
  });

  it('treats empty text as an empty config', () => {
    expect(parseConfigText('  \n')).toEqual({ config: {} });
  });

  it('reports invalid JSON', () => {
    expect(parseConfigText('{nope')).toHaveProperty('error');
  });

  it('rejects JSON that is not an object', () => {
    expect(parseConfigText('[1]')).toEqual({ error: 'The file must contain a JSON object.' });
  });
});

describe('formatConfig', () => {
  it('writes two-space indented JSON with a final newline, keeping the key order', () => {
    expect(formatConfig({ ecoreFile: 'a', options: {} })).toBe('{\n  "ecoreFile": "a",\n  "options": {}\n}\n');
  });
});
