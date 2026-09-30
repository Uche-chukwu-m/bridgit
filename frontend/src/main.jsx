import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource/overpass/400.css';
import '@fontsource/overpass/700.css';
import '@fontsource/overpass/900.css';
import 'leaflet/dist/leaflet.css';
import './index.css';
import App from './App';
import { BridgitProvider } from './state';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <BridgitProvider>
        <App />
      </BridgitProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
