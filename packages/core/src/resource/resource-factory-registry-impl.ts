import { ResourceFactory } from './resource-factory.js';
import { ResourceFactoryRegistry } from './resource-factory-registry.js';
import { URI } from './uri.js';

export class ResourceFactoryRegistryImpl implements ResourceFactoryRegistry {
  private readonly factoriesByExtension = new Map<string, ResourceFactory>();
  private readonly factoriesByProtocol = new Map<string, ResourceFactory>();

  registerForExtension(extension: string, factory: ResourceFactory): void {
    this.factoriesByExtension.set(extension, factory);
  }

  registerForProtocol(protocol: string, factory: ResourceFactory): void {
    this.factoriesByProtocol.set(protocol, factory);
  }

  getFactory(uri: URI): ResourceFactory | undefined {
    const extension = uri.getFileExtension();
    if (extension) {
      const byExtension = this.factoriesByExtension.get(extension);
      if (byExtension) return byExtension;
    }
    return this.factoriesByProtocol.get(uri.getScheme());
  }
}
