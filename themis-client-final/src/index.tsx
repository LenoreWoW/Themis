import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { EasterEggProvider } from './context/EasterEggContext';
// Import services that need initialization
import './services/initServices';
// Add import for notification styles
import './styles/notification-highlight.css';

// Fix for Emotion provider issues with multiple React versions
// @ts-ignore
window.React = React;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Disable strict mode to prevent double-mounting issues with hooks
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <EasterEggProvider>
        <App />
      </EasterEggProvider>
    </PersistGate>
  </Provider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 