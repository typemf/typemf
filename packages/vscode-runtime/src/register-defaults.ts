import { ResourceFactoryRegistry } from '@typemf/core';
import { registerJsonFormat } from '@typemf/json';
import { registerXmiFormat } from '@typemf/xmi';

/**
 * Registers the two formats that are safe in every environment this runtime runs in - the
 * extension host (Node) and a webview (browser), both of which need to work since a shared
 * runtime instance is used from both:
 *
 * - "json" (@typemf/json) - JSON.parse/stringify, no environment dependency at all.
 * - "xmi" and "ecore" (@typemf/xmi) - genuine XML parsing, but @typemf/xmi's own parseXmlDocument
 *   feature-detects the native browser DOMParser first and only falls back to a dynamic
 *   `import('@xmldom/xmldom')` when that's absent (Node) - confirmed by reading that code
 *   directly, not assumed, so this is safe to call unconditionally here.
 *
 * Deliberately does NOT register anything into a UriConverterRegistry, and never will from this
 * function specifically: every concrete UriConverter (e.g. @typemf/node's fs-backed one) is tied
 * to one specific environment, and this function's whole point is to only register things that
 * work everywhere this runtime runs. A Node-only or browser-only converter gets registered by
 * whoever assembles the runtime for that specific environment, not by this shared default.
 *
 * Exported standalone (not just called internally by TypeMfRuntime) so a plain Node script, test,
 * or any other consumer of @typemf/core's ResourceFactoryRegistry can opt into the same defaults
 * without needing @typemf/vscode-runtime or VS Code at all.
 */
export function registerDefaults(registry: ResourceFactoryRegistry): void {
  registerJsonFormat(registry);
  registerXmiFormat(registry);
}
