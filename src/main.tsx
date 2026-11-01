import React from 'react';
import ReactDOM from 'react-dom/client';
// Shared styles — loaded before component styles so design tokens
// and base element defaults are available to every component.
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import { App } from './app/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
