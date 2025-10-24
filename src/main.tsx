
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { domainMonitor } from './utils/domainMonitor'

// Detecção INSTANTÂNEA via protocolo (funciona antes do Capacitor carregar)
const isNative = window.location.protocol === 'capacitor:';

// Initialize domain monitoring APENAS EM WEB
if (!isNative) {
  domainMonitor.init();
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
