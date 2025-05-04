import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/easterEgg.css';
import './i18n';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { EasterEggProvider } from './context/EasterEggContext';
import { cleanupMockData } from './utils/cleanupUtils';

// FORCE CLEAN: Remove all mock data by directly purging localStorage
// This is a brute force approach to clean up corrupt data
console.log('FORCE CLEAN: Purging localStorage of corrupt mock data');
localStorage.removeItem('changeRequests');
localStorage.setItem('changeRequests', JSON.stringify([]));

// Set initial direction before app renders
const savedLanguage = localStorage.getItem('themisLanguage');
if (savedLanguage === 'ar') {
  document.documentElement.dir = 'rtl';
  document.dir = 'rtl';
  
  // Load Arabic font
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.id = 'arabic-font';
  link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
  document.head.appendChild(link);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <EasterEggProvider>
        <App />
      </EasterEggProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 