import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const _k = 'T3JpZ2luYWwgRGV2ZWxvcGVyOiBUYXJ1biAodGFydW4xMS54eXpAZ21haWwuY29tKSB8IEFwcDogWW91RHJhdw==';
  Object.defineProperty(window, '_yd_core_identity', {
    get: () => atob(_k),
    enumerable: false,
    configurable: false
  });
  console.debug('%c[Core] init', 'color:transparent;font-size:1px;padding:0;');
} catch(e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
