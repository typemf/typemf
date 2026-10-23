import type { JsonObject } from './protocol.js';

export type ParsedConfigText = { config: JsonObject } | { error: string };

/** Parses the text of a config file for editing. Empty text is an empty config. */
export function parseConfigText(text: string): ParsedConfigText {
  if (text.trim() === '') return { config: {} };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { error: (err as Error).message };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { error: 'The file must contain a JSON object.' };
  }
  return { config: parsed as JsonObject };
}

export function formatConfig(config: JsonObject): string {
  return JSON.stringify(config, null, 2) + '\n';
}
