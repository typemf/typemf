/** The part of JSON Schema the options form understands. */
export interface Schema {
  type?: string;
  description?: string;
  enum?: unknown[];
  default?: unknown;
  properties?: Record<string, Schema>;
  additionalProperties?: Schema | boolean;
  items?: Schema;
  /** What the keys of a map are, so the editor can suggest them. */
  'x-typemf-key'?: string;
}

/** Whether the form can edit values of this schema; anything else is edited as JSON text. */
export function isSupported(schema: Schema | undefined): schema is Schema {
  if (!schema?.type) return false;
  switch (schema.type) {
    case 'boolean':
    case 'string':
    case 'number':
    case 'integer':
      return true;
    case 'array':
      return isSupported(schema.items);
    case 'object':
      if (schema.properties) return Object.values(schema.properties).every(isSupported);
      return typeof schema.additionalProperties === 'object' && isSupported(schema.additionalProperties);
    default:
      return false;
  }
}

export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  return typeof value === 'object' && value !== null && Object.keys(value).length === 0;
}

/** A copy of `object` with `key` set to `value`, or removed when the value is undefined or empty. */
export function withEntry(object: Record<string, unknown>, key: string, value: unknown): Record<string, unknown> {
  const copy = { ...object };
  if (isEmptyValue(value)) delete copy[key];
  else copy[key] = value;
  return copy;
}

/** A copy of `object` where the entry `from` is called `to`, in the same position. */
export function renameKey(object: Record<string, unknown>, from: string, to: string): Record<string, unknown> {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key === from ? to : key, value]));
}
