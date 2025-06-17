
import { useEffect } from 'react';

interface DiagnosticInfo {
  timestamp: string;
  userAgent: string;
  url: string;
  viewport: string;
  errorCount: number;
}

export const DiagnosticLogger = () => {
  useEffect(() => {
    const logDiagnostics = () => {
      const diagnostics: DiagnosticInfo = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        errorCount: 0
      };

      console.log('🔍 Diagnósticos da aplicação:', diagnostics);
      
      // Log de recursos carregados
      if (document.readyState === 'complete') {
        console.log('✅ Documento carregado completamente');
      } else {
        console.log('⏳ Documento ainda carregando:', document.readyState);
      }

      // Verificar se há erros de JavaScript
      const originalError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        console.error('🚨 Erro JavaScript detectado:', {
          message,
          source,
          line: lineno,
          column: colno,
          error
        });
        if (originalError) {
          return originalError(message, source, lineno, colno, error);
        }
        return false;
      };

      // Verificar recursos não carregados
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.complete || img.naturalHeight === 0) {
          console.warn(`⚠️ Imagem ${index + 1} não carregou:`, img.src);
        }
      });
    };

    // Log inicial
    logDiagnostics();

    // Log quando a página terminar de carregar
    if (document.readyState === 'loading') {
      window.addEventListener('load', logDiagnostics);
      return () => window.removeEventListener('load', logDiagnostics);
    }
  }, []);

  return null;
};
