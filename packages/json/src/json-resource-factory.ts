import { Resource, ResourceFactory, ResourceFactoryRegistry, ResourceImpl, URI } from '@typemf/core';
import { JsonSerializer } from './json-serializer.js';

export class JsonResourceFactory implements ResourceFactory {
  createResource(uri: URI): Resource {
    return new ResourceImpl(uri, new JsonSerializer());
  }
}

/**
 * Auto-registers this format for the "json" extension - matches the
 * "opt-out, not opt-in" decision for built-in formats: something wiring up
 * a runtime (e.g. @typemf/vscode-runtime's TypeMfRuntime) calls this once
 * rather than every consumer having to remember to. A third-party format
 * plugin registers itself the exact same way, via the same
 * ResourceFactoryRegistry methods - no special-casing for "official" ones.
 */
export function registerJsonFormat(registry: ResourceFactoryRegistry): void {
  registry.registerForExtension('json', new JsonResourceFactory());
}
