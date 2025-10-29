import '../css/app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

const el = document.getElementById('app');
if (el) {
  const root = createRoot(el);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
