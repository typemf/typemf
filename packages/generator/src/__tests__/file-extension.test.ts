import nunjucks from 'nunjucks';
import { describe, expect, it } from 'vitest';
import { FileExtension } from '../file-extension.js';

describe('FileExtension', () => {
  it('collects one file per {% file %} block, with a computed path expression', () => {
    const env = new nunjucks.Environment(null, { autoescape: false });
    const ext = new FileExtension();
    env.addExtension('file', ext);

    const template = `
{% file "hello-" + name + ".txt" %}
Hello, {{ name }}!
{% endfile %}
{% file "bye.txt" %}
Goodbye.
{% endfile %}
`;

    env.renderString(template, { name: 'World' });
    const files = ext.getCollected();

    expect(files).toHaveLength(2);
    expect(files[0]!.path).toBe('hello-World.txt');
    expect(files[0]!.content).toContain('Hello, World!');
    expect(files[1]!.path).toBe('bye.txt');
    expect(files[1]!.content).toContain('Goodbye.');
  });

  it('silently discards content outside any {% file %} block', () => {
    const env = new nunjucks.Environment(null, { autoescape: false });
    const ext = new FileExtension();
    env.addExtension('file', ext);

    env.renderString('before\n{% file "only.txt" %}kept{% endfile %}\nafter', {});
    const files = ext.getCollected();

    expect(files).toHaveLength(1);
    expect(files[0]!.content).toBe('kept');
  });

  it('produces zero files for a template with no {% file %} blocks at all', () => {
    const env = new nunjucks.Environment(null, { autoescape: false });
    const ext = new FileExtension();
    env.addExtension('file', ext);

    env.renderString('just some text, no directive', {});
    expect(ext.getCollected()).toHaveLength(0);
  });

  it('supports an arbitrary number of {% file %} blocks in one template', () => {
    const env = new nunjucks.Environment(null, { autoescape: false });
    const ext = new FileExtension();
    env.addExtension('file', ext);

    const template = `
{% for n in range(0, 5) %}
{% file "file-" + n + ".txt" %}content {{ n }}{% endfile %}
{% endfor %}
`;
    env.renderString(template, {});
    const files = ext.getCollected();

    expect(files).toHaveLength(5);
    expect(files.map((f) => f.path)).toEqual(['file-0.txt', 'file-1.txt', 'file-2.txt', 'file-3.txt', 'file-4.txt']);
  });
});
