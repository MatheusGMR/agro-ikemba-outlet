
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import App from './App.tsx'
import './index.css'
import { domainMonitor } from './utils/domainMonitor'

// Initialize domain monitoring APENAS EM WEB
if (!Capacitor.isNativePlatform()) {
  domainMonitor.init();
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
