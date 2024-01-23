import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './index.scss'
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
