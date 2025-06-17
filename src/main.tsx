
// Log inicial para diagnóstico
console.log('🎯 main.tsx executando...');
console.log('🌐 URL atual:', window.location.href);
console.log('📱 User Agent:', navigator.userAgent);

// Sistema de monitoramento de performance
const performanceMonitor = {
  start: performance.now(),
  
  logMilestone: (name: string) => {
    const elapsed = performance.now() - performanceMonitor.start;
    console.log(`⏱️ ${name}: ${elapsed.toFixed(2)}ms`);
  },
  
  logError: (context: string, error: any) => {
    console.error(`❌ Erro em ${context}:`, error);
    console.trace('Stack trace completo:');
  }
};

// Função para criar fallback de emergência com mais informações
const createEmergencyFallback = (reason: string = 'Erro desconhecido') => {
  performanceMonitor.logError('Emergency Fallback', reason);
  
  document.body.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Inter, Arial, sans-serif; background: #f9fafb;">
      <div style="text-center; max-width: 600px; padding: 2rem;">
        <div style="width: 64px; height: 64px; background: #075e54; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          </svg>
        </div>
        <h1 style="color: #075e54; font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">Agro Ikemba</h1>
        <p style="color: #6b7280; font-size: 1.125rem; margin-bottom: 1.5rem; line-height: 1.6;">
          Revolucionando o mercado de insumos agrícolas
        </p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
          <h3 style="color: #856404; font-size: 1rem; margin-bottom: 0.5rem;">Problema detectado:</h3>
          <p style="color: #856404; font-size: 0.875rem;">${reason}</p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.location.reload()" style="background: #075e54; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">
            Recarregar Página
          </button>
          <button onclick="localStorage.clear(); window.location.reload();" style="background: #dc3545; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">
            Limpar Cache e Recarregar
          </button>
        </div>
        <details style="margin-top: 1.5rem; text-align: left;">
          <summary style="cursor: pointer; color: #6c757d; font-size: 0.875rem;">Informações técnicas</summary>
          <pre style="background: #f8f9fa; padding: 1rem; border-radius: 4px; font-size: 0.75rem; overflow-x: auto; margin-top: 0.5rem;">
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
Reason: ${reason}
          </pre>
        </details>
      </div>
    </div>
  `;
};

// Verificação crítica do elemento root
const rootElement = document.getElementById("root");

if (!rootElement) {
  createEmergencyFallback('Elemento root não encontrado no DOM');
} else {
  console.log('✅ Elemento root encontrado, iniciando React...');
  performanceMonitor.logMilestone('Root element found');
  
  try {
    // Importação dinâmica para melhor tratamento de erros
    Promise.all([
      import('./App.tsx'),
      import('react'),
      import('react-dom/client')
    ])
      .then(([AppModule, React, ReactDOMClient]) => {
        performanceMonitor.logMilestone('Modules imported');
        
        const App = AppModule.default;
        const { createRoot } = ReactDOMClient;
        
        const root = createRoot(rootElement);
        
        // Renderização com fallback de erro
        root.render(React.createElement(App));
        
        performanceMonitor.logMilestone('React rendered');
        console.log('🚀 React renderizado com sucesso!');
        
        // Verificar se a renderização foi bem-sucedida após um tempo
        setTimeout(() => {
          if (rootElement.innerHTML.includes('Carregando...')) {
            console.warn('⚠️ Página ainda mostrando loading após 3 segundos');
            performanceMonitor.logError('Rendering timeout', 'Page still loading after 3 seconds');
          }
        }, 3000);
      })
      .catch((error) => {
        performanceMonitor.logError('Module loading', error);
        createEmergencyFallback(`Erro ao carregar módulos React: ${error.message}`);
      });

  } catch (error) {
    performanceMonitor.logError('Critical error in main.tsx', error);
    createEmergencyFallback(`Erro crítico no main.tsx: ${error.message}`);
  }
}

// Tratamento global de erros não capturados
window.addEventListener('error', (event) => {
  performanceMonitor.logError('Global error', event.error);
  
  // Se for um erro crítico de carregamento, mostrar fallback
  if (event.filename?.includes('main.tsx') || event.message?.includes('Loading chunk')) {
    createEmergencyFallback(`Erro de carregamento: ${event.message}`);
  }
});

// Tratamento de promessas rejeitadas
window.addEventListener('unhandledrejection', (event) => {
  performanceMonitor.logError('Unhandled promise rejection', event.reason);
  
  // Se for erro de carregamento de módulo, ativar fallback
  if (event.reason?.message?.includes('Loading chunk') || 
      event.reason?.message?.includes('Failed to fetch')) {
    createEmergencyFallback(`Erro de carregamento de módulo: ${event.reason?.message}`);
  }
});

// Log final de inicialização
performanceMonitor.logMilestone('Main.tsx setup complete');
