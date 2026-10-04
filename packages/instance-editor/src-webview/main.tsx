import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { isInitMessage, isSettingsMessage } from '../src/host-message-protocol.js';
import { createWebviewEnvironment } from './webview-environment.js';
import { vscodeApi } from './vscode-api.js';

const environment = createWebviewEnvironment();

function Root(): React.JSX.Element {
  const [rootId, setRootId] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  // InitMessage's own showDerivedFeatures covers the initial value; SettingsMessage (a separate
  // message, not re-sent at init time - see its own reasoning) covers every later, live change.
  const [showDerivedFeatures, setShowDerivedFeatures] = useState(false);

  useEffect(() => {
    const unsubscribe = environment.onMessage((message) => {
      if (isInitMessage(message)) {
        setRootId(message.rootId);
        setShowDerivedFeatures(message.showDerivedFeatures);
        setReady(true);
      } else if (isSettingsMessage(message)) {
        setShowDerivedFeatures(message.showDerivedFeatures);
      }
    });
    vscodeApi.postMessage({ type: 'typemf/ready' });
    return unsubscribe;
  }, []);

  if (!ready) {
    return (
      <div className="app app-loading">
        <p>Connecting…</p>
      </div>
    );
  }

  return <App environment={environment} rootId={rootId} showDerivedFeatures={showDerivedFeatures} />;
}

const container = document.getElementById('root');
if (!container) throw new Error("main.tsx: no #root element found in the webview's own HTML.");
createRoot(container).render(<Root />);
