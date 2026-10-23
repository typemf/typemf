import React, { useState } from 'react';
import { isSupported, renameKey, Schema, withEntry } from '../../src/generator-editor/form-schema.js';

/** Suggestions for the keys of a map, by the `x-typemf-key` of its schema. */
export type Suggestions = Record<string, string[]>;

interface FieldProps {
  schema: Schema;
  value: unknown;
  onChange: (value: unknown) => void;
  suggestions: Suggestions;
}

export function SchemaField({ schema, value, onChange, suggestions }: FieldProps): React.JSX.Element {
  if (!isSupported(schema)) return <JsonField value={value} onChange={onChange} />;
  switch (schema.type) {
    case 'boolean':
      return <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />;
    case 'number':
    case 'integer':
      return (
        <input
          type="number"
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      );
    case 'string':
      if (schema.enum) {
        return (
          <select
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(e.target.value || undefined)}
          >
            <option value=""></option>
            {schema.enum.map((option) => (
              <option key={String(option)} value={String(option)}>
                {String(option)}
              </option>
            ))}
          </select>
        );
      }
      return (
        <input type="text" value={typeof value === 'string' ? value : ''} onChange={(e) => onChange(e.target.value)} />
      );
    case 'array':
      return <ArrayField schema={schema} value={value} onChange={onChange} suggestions={suggestions} />;
    default:
      return schema.properties ? (
        <ObjectField schema={schema} value={value} onChange={onChange} suggestions={suggestions} />
      ) : (
        <MapField schema={schema} value={value} onChange={onChange} suggestions={suggestions} />
      );
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function ObjectField({ schema, value, onChange, suggestions }: FieldProps): React.JSX.Element {
  const object = asObject(value);
  return (
    <div className="form-object">
      {Object.entries(schema.properties ?? {}).map(([name, propertySchema]) => (
        <div className="form-row" key={name}>
          <label className="form-label" title={propertySchema.description}>
            {name}
          </label>
          <div className="form-value">
            <SchemaField
              schema={propertySchema}
              value={object[name]}
              onChange={(next) => onChange(withEntry(object, name, next))}
              suggestions={suggestions}
            />
            {propertySchema.description && <p className="form-hint">{propertySchema.description}</p>}
          </div>
          {object[name] !== undefined && (
            <button
              className="icon-button"
              title="Remove this entry"
              onClick={() => onChange(withEntry(object, name, undefined))}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function MapField({ schema, value, onChange, suggestions }: FieldProps): React.JSX.Element {
  const object = asObject(value);
  const valueSchema = schema.additionalProperties as Schema;
  const listId = React.useId();
  const keyKind = schema['x-typemf-key'];
  const offered = (keyKind ? (suggestions[keyKind] ?? []) : []).filter((key) => !(key in object));
  const [newKey, setNewKey] = useState('');

  const add = (): void => {
    const key = newKey.trim();
    if (key === '' || key in object) return;
    onChange({ ...object, [key]: valueSchema.type === 'object' ? {} : valueSchema.type === 'boolean' ? false : '' });
    setNewKey('');
  };

  return (
    <div className="form-map">
      {Object.entries(object).map(([key, entry]) => (
        <div className="form-map-entry" key={key}>
          <div className="form-map-key">
            <KeyInput
              key={key}
              value={key}
              listId={listId}
              onCommit={(next) =>
                next !== key && next !== '' && !(next in object) && onChange(renameKey(object, key, next))
              }
            />
            <button
              className="icon-button"
              title="Remove this entry"
              onClick={() => onChange(withEntry(object, key, undefined))}
            >
              ×
            </button>
          </div>
          <div className="form-map-value">
            <SchemaField
              schema={valueSchema}
              value={entry}
              onChange={(next) => onChange({ ...object, [key]: next ?? '' })}
              suggestions={suggestions}
            />
          </div>
        </div>
      ))}
      <div className="form-map-add">
        <input
          type="text"
          list={listId}
          placeholder={
            keyKind === 'nsURI' ? 'nsURI of a package' : keyKind === 'classifier' ? 'nsURI#data type' : 'key'
          }
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button onClick={add} disabled={newKey.trim() === '' || newKey.trim() in object}>
          Add
        </button>
      </div>
      <datalist id={listId}>
        {offered.map((key) => (
          <option key={key} value={key} />
        ))}
      </datalist>
    </div>
  );
}

/** A text field that changes the key only when editing is done, so a half-typed key never replaces another. */
function KeyInput({
  value,
  listId,
  onCommit,
}: {
  value: string;
  listId: string;
  onCommit: (key: string) => void;
}): React.JSX.Element {
  const [draft, setDraft] = useState(value);
  return (
    <input
      type="text"
      list={listId}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => (draft === value ? undefined : onCommit(draft.trim()))}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
    />
  );
}

function ArrayField({ schema, value, onChange, suggestions }: FieldProps): React.JSX.Element {
  const items = Array.isArray(value) ? (value as unknown[]) : [];
  const itemSchema = schema.items as Schema;
  return (
    <div className="form-array">
      {items.map((item, index) => (
        <div className="form-array-item" key={index}>
          <SchemaField
            schema={itemSchema}
            value={item}
            onChange={(next) => onChange(items.map((existing, i) => (i === index ? next : existing)))}
            suggestions={suggestions}
          />
          <button
            className="icon-button"
            title="Remove this item"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          onChange([...items, itemSchema.type === 'object' ? {} : itemSchema.type === 'boolean' ? false : ''])
        }
      >
        Add item
      </button>
    </div>
  );
}

/** Edits a value as JSON text, for schemas the form cannot show as fields. The text is applied once it parses. */
export function JsonField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
}): React.JSX.Element {
  const shown = value === undefined ? '' : JSON.stringify(value, null, 2);
  const [draft, setDraft] = useState(shown);
  const [seen, setSeen] = useState(shown);
  const [error, setError] = useState<string>();
  // The value changed from outside: show it, unless the draft already means the same value.
  if (shown !== seen) {
    setSeen(shown);
    if (!draftMeans(draft, value)) setDraft(shown);
  }

  return (
    <div className="form-json">
      <textarea
        rows={Math.min(12, Math.max(3, draft.split('\n').length))}
        value={draft}
        spellCheck={false}
        onChange={(e) => {
          setDraft(e.target.value);
          if (e.target.value.trim() === '') {
            setError(undefined);
            onChange(undefined);
            return;
          }
          try {
            onChange(JSON.parse(e.target.value));
            setError(undefined);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function draftMeans(draft: string, value: unknown): boolean {
  if (draft.trim() === '') return value === undefined;
  try {
    return JSON.stringify(JSON.parse(draft)) === JSON.stringify(value);
  } catch {
    return false;
  }
}
