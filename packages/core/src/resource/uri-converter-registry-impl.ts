import { URI } from './uri.js';
import { UriConverter } from './uri-converter.js';
import { UriConverterRegistry } from './uri-converter-registry.js';

export class UriConverterRegistryImpl implements UriConverterRegistry {
  private readonly converters: UriConverter[] = [];

  register(converter: UriConverter): void {
    this.converters.push(converter);
  }

  unregister(converter: UriConverter): void {
    const index = this.converters.indexOf(converter);
    if (index !== -1) this.converters.splice(index, 1);
  }

  getConverter(uri: URI): UriConverter | undefined {
    return this.converters.find((converter) => converter.canHandle(uri));
  }

  getConverters(): UriConverter[] {
    return [...this.converters];
  }
}
