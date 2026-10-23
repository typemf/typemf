import React, { useCallback, useEffect, useState } from 'react';
import type {
  GenerateResultMessage,
  JsonObject,
  ModelSummaryView,
  PickField,
  StateMessage,
  SummaryMessage,
  WebviewToHostMessage,
} from '../../src/generator-editor/protocol.js';
import { vscodeApi } from '../vscode-api.js';
import { isSupported, Schema } from '../../src/generator-editor/form-schema.js';
import { JsonField, SchemaField } from './SchemaForm.js';

function send(message: WebviewToHostMessage): void {
  vscodeApi.postMessage(message);
}

type Result = Omit<GenerateResultMessage, 'type'>;

export function App(): React.JSX.Element {
  const [state, setState] = useState<StateMessage>();
  const [config, setConfig] = useState<JsonObject>({});
  const [summary, setSummary] = useState<SummaryMessage>();
  const [result, setResult] = useState<Result>();
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const listener = (event: MessageEvent<{ type?: string }>): void => {
      const message = event.data;
      if (message.type === 'typemf/generator/state') {
        const next = message as StateMessage;
        setState(next);
        if (next.config && !next.echo) setConfig(next.config);
      } else if (message.type === 'typemf/generator/summary') {
        setSummary(message as SummaryMessage);
      } else if (message.type === 'typemf/generator/generateResult') {
        setResult(message as GenerateResultMessage);
        setGenerating(false);
      }
    };
    window.addEventListener('message', listener);
    send({ type: 'typemf/generator/ready' });
    return () => window.removeEventListener('message', listener);
  }, []);

  const update = useCallback((next: JsonObject): void => {
    setConfig(next);
    send({ type: 'typemf/generator/edit', config: next });
  }, []);

  const ecoreFile = typeof config.ecoreFile === 'string' ? config.ecoreFile : '';
  useEffect(() => {
    if (ecoreFile === '') return;
    const timer = setTimeout(() => send({ type: 'typemf/generator/requestSummary', ecoreFile }), 400);
    return () => clearTimeout(timer);
  }, [ecoreFile]);

  if (!state) return <p className="status">Connecting…</p>;

  if (state.parseError !== undefined) {
    return (
      <div className="generator">
        <h1>Generator config</h1>
        <p className="form-error">This file is not valid JSON: {state.parseError}</p>
        <button onClick={() => send({ type: 'typemf/generator/openAsText' })}>Edit as text</button>
      </div>
    );
  }

  const templateSetName = typeof config.templateSet === 'string' ? config.templateSet : '';
  const templateSet = state.templateSets.find((candidate) => candidate.name === templateSetName);
  const optionsSchema = templateSet?.optionsSchema as Schema | undefined;
  const currentSummary = summary?.ecoreFile === ecoreFile ? summary : undefined;
  const suggestions = {
    nsURI: currentSummary?.summary?.referencedPackages ?? [],
    classifier: currentSummary?.summary?.dataTypes ?? [],
  };
  const canGenerate =
    ecoreFile !== '' && typeof config.outputDir === 'string' && config.outputDir !== '' && templateSet !== undefined;

  const field = (name: 'ecoreFile' | 'outputDir' | 'templateSet', value: string): void =>
    update({ ...config, [name]: value });
  const pick = (name: PickField): void => send({ type: 'typemf/generator/pick', field: name });

  return (
    <div className="generator">
      <header className="generator-header">
        <h1>Generator config</h1>
        <div className="generator-actions">
          <button
            className="primary"
            disabled={!canGenerate || generating}
            onClick={() => {
              setResult(undefined);
              setGenerating(true);
              send({ type: 'typemf/generator/generate' });
            }}
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
          <button onClick={() => send({ type: 'typemf/generator/openAsText' })}>Edit as text</button>
        </div>
      </header>

      {result && <ResultPanel result={result} />}

      <section>
        <h2>Model</h2>
        <div className="form-row">
          <label className="form-label" htmlFor="ecoreFile">
            Ecore file
          </label>
          <div className="form-value with-button">
            <input id="ecoreFile" type="text" value={ecoreFile} onChange={(e) => field('ecoreFile', e.target.value)} />
            <button onClick={() => pick('ecoreFile')}>Browse…</button>
          </div>
        </div>
        {ecoreFile !== '' && <ModelLine summary={currentSummary} />}
      </section>

      <section>
        <h2>Output</h2>
        <div className="form-row">
          <label className="form-label" htmlFor="outputDir">
            Output folder
          </label>
          <div className="form-value with-button">
            <input
              id="outputDir"
              type="text"
              value={typeof config.outputDir === 'string' ? config.outputDir : ''}
              onChange={(e) => field('outputDir', e.target.value)}
            />
            <button onClick={() => pick('outputDir')}>Browse…</button>
          </div>
        </div>
      </section>

      <section>
        <h2>Template set</h2>
        <div className="form-row">
          <label className="form-label" htmlFor="templateSet">
            Template set
          </label>
          <div className="form-value with-button">
            <select id="templateSet" value={templateSetName} onChange={(e) => field('templateSet', e.target.value)}>
              {templateSetName === '' && <option value=""></option>}
              {!templateSet && templateSetName !== '' && (
                <option value={templateSetName}>{templateSetName} (not found)</option>
              )}
              {state.templateSets.map((candidate) => (
                <option key={candidate.name} value={candidate.name}>
                  {candidate.name}
                </option>
              ))}
            </select>
            <button onClick={() => send({ type: 'typemf/generator/addTemplateSetPackage' })}>Add package…</button>
          </div>
        </div>
        {templateSet && (
          <p className="form-hint">
            {templateSet.description ? `${templateSet.description} · ` : ''}from {templateSet.origin}
            {templateSet.runsCode && ' · runs code from the workspace when generating'}
          </p>
        )}
        {!templateSet && templateSetName !== '' && (
          <p className="form-error">
            No template set named '{templateSetName}'. Install the package that provides it, or add its folder with “Add
            package…”.
          </p>
        )}
        {state.templateSetProblems.map((problem) => (
          <p className="form-error" key={problem}>
            {problem}
          </p>
        ))}
      </section>

      <section>
        <h2>Options</h2>
        {templateSetName === '' ? (
          <p className="form-hint">Choose a template set first.</p>
        ) : isSupported(optionsSchema) && optionsSchema.type === 'object' ? (
          <SchemaField
            schema={optionsSchema}
            value={config.options}
            onChange={(next) => update({ ...config, options: next ?? {} })}
            suggestions={suggestions}
          />
        ) : (
          <JsonField value={config.options} onChange={(next) => update({ ...config, options: next ?? {} })} />
        )}
        {state.problems.map((problem) => (
          <p className="form-error" key={problem}>
            {problem}
          </p>
        ))}
      </section>
    </div>
  );
}

function ModelLine({ summary }: { summary: SummaryMessage | undefined }): React.JSX.Element {
  if (!summary) return <p className="form-hint">Loading the model…</p>;
  if (summary.error) return <p className="form-error">{summary.error}</p>;
  const model = summary.summary as ModelSummaryView;
  return (
    <p className="form-hint">
      Package {model.name} ({model.nsURI})
      {model.referencedPackages.length > 0 && ` · refers to ${model.referencedPackages.length} other package(s)`}
    </p>
  );
}

function ResultPanel({ result }: { result: Result }): React.JSX.Element {
  if (result.status === 'failed') return <div className="result result-failed">Generation failed: {result.error}</div>;
  if (result.status === 'cancelled') return <div className="result">Cancelled, nothing was written.</div>;
  return (
    <div className="result result-done">
      <p>
        Wrote {result.files?.length ?? 0} file(s) to {result.outputRoot}
      </p>
      <details>
        <summary>Files</summary>
        <ul>
          {result.files?.map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
