import { describe, expect, it } from 'vitest';
import { relativeToDir } from '../../generator-editor/relative-path.js';

describe('relativeToDir', () => {
  it('starts a path below the folder with ./', () => {
    expect(relativeToDir('/work/models', '/work/models/sub/a.ecore')).toBe('./sub/a.ecore');
  });

  it('climbs up with ../', () => {
    expect(relativeToDir('/work/models', '/work/src/generated')).toBe('../src/generated');
  });

  it('names the folder itself .', () => {
    expect(relativeToDir('/work/models', '/work/models')).toBe('.');
  });
});
