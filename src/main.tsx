
// Log inicial para diagnóstico
console.log('🎯 main.tsx executando...');
console.log('🌐 URL atual:', window.location.href);
console.log('📱 User Agent:', navigator.userAgent);

// Função para criar fallback de emergência
const createEmergencyFallback = () => {
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Inter, Arial, sans-serif; background: #f9fafb;">
      <div style="text-center; max-width: 500px; padding: 2rem;">
        <div style="width: 64px; height: 64px; background: #075e54; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          </svg>
        </div>
        <h1 style="color: #075e54; font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Agro Ikemba</h1>
        <p style="color: #6b7280; font-size: 1.125rem; margin-bottom: 1.5rem; line-height: 1.6;">
          Revolucionando o mercado de insumos agrícolas
        </p>
        <p style="color: #9ca3af; font-size: 0.875rem; margin-bottom: 2rem;">
          Conectando fabricantes e distribuidores com as melhores condições comerciais do mercado
        </p>
        <button onclick="window.location.reload()" style="background: #075e54; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">
          Recarregar Página
        </button>
        <p style="color: #d1d5db; font-size: 0.75rem; margin-top: 1rem;">
          Se o problema persistir, tente limpar o cache do navegador
        </p>
      </div>
    </div>
  `;
};

// Verificação crítica do elemento root
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('❌ Elemento root não encontrado!');
  createEmergencyFallback();
} else {
  console.log('✅ Elemento root encontrado, iniciando React...');
  
  try {
    // Importação dinâmica para melhor tratamento de erros
    import('./App.tsx')
      .then((AppModule) => {
        const App = AppModule.default;
        
        // Importação dinâmica do React
        return Promise.all([
          import('react-dom/client'),
          Promise.resolve(App)
        ]);
      })
      .then(([ReactDOMClient, App]) => {
        const { createRoot } = ReactDOMClient;
        const root = createRoot(rootElement);
        
        // Renderização com fallback de erro
        root.render(App());
        console.log('🚀 React renderizado com sucesso!');
      })
      .catch((error) => {
        console.error('❌ Erro ao carregar módulos React:', error);
        createEmergencyFallback();
      });

  } catch (error) {
    console.error('❌ Erro crítico no main.tsx:', error);
    createEmergencyFallback();
  }
}

// Tratamento global de erros não capturados
window.addEventListener('error', (event) => {
  console.error('🚨 Erro global capturado:', event.error);
  
  // Se for um erro crítico de carregamento, mostrar fallback
  if (event.filename?.includes('main.tsx') || event.message?.includes('Loading chunk')) {
    console.error('❌ Erro crítico detectado, ativando fallback');
    createEmergencyFallback();
  }
});

// Tratamento de promessas rejeitadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Promise rejeitada:', event.reason);
  
  // Se for erro de carregamento de módulo, ativar fallback
  if (event.reason?.message?.includes('Loading chunk') || 
      event.reason?.message?.includes('Failed to fetch')) {
    console.error('❌ Erro de carregamento detectado, ativando fallback');
    createEmergencyFallback();
  }
});
