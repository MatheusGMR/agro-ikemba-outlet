import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { domainMonitor } from './utils/domainMonitor'

// ============================================
// DEBUG VISUAL (NÃO PODE SER REMOVIDO PELO MINIFIER)
// ============================================
const debugDiv = document.createElement('div');
debugDiv.id = 'protocol-debug';
debugDiv.style.cssText = 'position:fixed;top:0;left:0;background:red;color:white;padding:10px;z-index:99999;font-size:12px;max-width:100vw;word-break:break-all;';
debugDiv.innerHTML = `
  <strong>DEBUG INFO:</strong><br/>
  Protocol: ${window.location.protocol}<br/>
  Href: ${window.location.href}<br/>
  UserAgent: ${navigator.userAgent.substring(0, 50)}...
`;
document.body.appendChild(debugDiv);

// Detecção INSTANTÂNEA via protocolo (funciona antes do Capacitor carregar)
const isNative = window.location.protocol === 'capacitor:';

// Adicionar ao debug visual
debugDiv.innerHTML += `<br/>isNative: ${isNative}<br/>domainMonitor will run: ${!isNative}`;

// Initialize domain monitoring APENAS EM WEB
if (!isNative) {
  domainMonitor.init();
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
