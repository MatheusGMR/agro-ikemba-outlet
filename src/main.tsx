
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log inicial para diagnóstico
console.log('🎯 main.tsx executando...');
console.log('🌐 URL atual:', window.location.href);
console.log('📱 User Agent:', navigator.userAgent);

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('❌ Elemento root não encontrado!');
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <h1>Erro: Elemento root não encontrado</h1>
        <p>Por favor, recarregue a página.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #075e54; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recarregar
        </button>
      </div>
    </div>
  `;
} else {
  console.log('✅ Elemento root encontrado, iniciando React...');
  
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('🚀 React renderizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao renderizar React:', error);
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
        <div style="text-align: center;">
          <h1>Agro Ikemba</h1>
          <p>Erro ao carregar a aplicação. Recarregue a página.</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #075e54; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Recarregar
          </button>
        </div>
      </div>
    `;
  }
}
