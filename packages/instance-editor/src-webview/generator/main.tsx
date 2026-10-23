import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

const container = document.getElementById('root');
if (!container) throw new Error('main.tsx: no #root element found in the webview HTML.');
createRoot(container).render(<App />);
