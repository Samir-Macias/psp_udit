import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from '../../src/main/java/org/example/UDITflix/uditflix_reto_3_dashboard-2';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
);
