
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { domainMonitor } from './utils/domainMonitor'

// Initialize domain monitoring
domainMonitor.init();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
