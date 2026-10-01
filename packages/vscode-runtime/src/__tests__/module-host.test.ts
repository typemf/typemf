import { describe, expect, it } from 'vitest';
import { ModuleHost } from '../module-host.js';

describe('ModuleHost', () => {
  it('returns a provided module when its version satisfies the range', () => {
    const host = new ModuleHost();
    const core = { name: 'core' };
    host.provide('@typemf/core', '0.5.0', core);

    expect(host.require('@typemf/core', '^0.5.0')).toBe(core);
  });

  it('loads a declared module once, on its first request', () => {
    const host = new ModuleHost();
    let loads = 0;
    host.declare({ name: '@acme/model', version: '1.2.0', provider: 'acme.model', load: () => ({ loads: ++loads }) });

    expect(loads).toBe(0);
    const first = host.require('@acme/model', '^1.0.0');
    expect(host.require('@acme/model', '1.2.0')).toBe(first);
    expect(loads).toBe(1);
  });

  it('throws when the version does not satisfy the range', () => {
    const host = new ModuleHost();
    host.provide('@typemf/core', '0.5.0', {});

    expect(() => host.require('@typemf/core', '^0.6.0')).toThrow(/0\.5\.0 .* does not satisfy the requested range '\^0\.6\.0'/);
  });

  it('throws for a module nobody provides', () => {
    expect(() => new ModuleHost().require('@acme/missing', '*')).toThrow(/No installed extension provides module '@acme\/missing'/);
  });

  it('refuses a module declared by more than one extension', () => {
    const host = new ModuleHost();
    host.declare({ name: '@acme/model', version: '1.0.0', provider: 'acme.a', load: () => ({}) });
    host.declare({ name: '@acme/model', version: '1.0.0', provider: 'acme.b', load: () => ({}) });

    expect(() => host.require('@acme/model', '*')).toThrow(/more than one extension \(acme\.a, acme\.b\)/);
  });

  it('rejects an invalid version', () => {
    expect(() =>
      new ModuleHost().declare({ name: '@acme/model', version: 'latest', provider: 'acme.a', load: () => ({}) })
    ).toThrow(/invalid version 'latest'/);
  });
});
