
import { useEffect, useState } from 'react';

interface DiagnosticResult {
  timestamp: string;
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const AdvancedDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: DiagnosticResult[] = [];
      const timestamp = new Date().toISOString();

      // Test 1: Basic DOM
      try {
        const rootElement = document.getElementById('root');
        results.push({
          timestamp,
          test: 'DOM Root Element',
          status: rootElement ? 'success' : 'error',
          message: rootElement ? 'Root element found' : 'Root element missing',
          details: { exists: !!rootElement, innerHTML: rootElement?.innerHTML?.substring(0, 100) }
        });
      } catch (error) {
        results.push({
          timestamp,
          test: 'DOM Root Element',
          status: 'error',
          message: 'Error checking root element',
          details: error
        });
      }

      // Test 2: React Version
      try {
        const reactVersion = require('react').version;
        results.push({
          timestamp,
          test: 'React Version',
          status: 'success',
          message: `React ${reactVersion} loaded`,
          details: { version: reactVersion }
        });
      } catch (error) {
        results.push({
          timestamp,
          test: 'React Version',
          status: 'error',
          message: 'React not loaded properly',
          details: error
        });
      }

      // Test 3: CSS Loading
      try {
        const styles = window.getComputedStyle(document.body);
        const hasFont = styles.fontFamily.includes('Inter');
        results.push({
          timestamp,
          test: 'CSS Styles',
          status: hasFont ? 'success' : 'warning',
          message: hasFont ? 'CSS loaded correctly' : 'CSS may not be loading',
          details: { 
            fontFamily: styles.fontFamily,
            backgroundColor: styles.backgroundColor,
            margin: styles.margin
          }
        });
      } catch (error) {
        results.push({
          timestamp,
          test: 'CSS Styles',
          status: 'error',
          message: 'Error checking CSS',
          details: error
        });
      }

      // Test 4: Network Connectivity
      try {
        const response = await fetch('/vite.svg', { method: 'HEAD' });
        results.push({
          timestamp,
          test: 'Network Connectivity',
          status: response.ok ? 'success' : 'warning',
          message: response.ok ? 'Network working' : 'Network issues detected',
          details: { status: response.status, statusText: response.statusText }
        });
      } catch (error) {
        results.push({
          timestamp,
          test: 'Network Connectivity',
          status: 'error',
          message: 'Network error',
          details: error
        });
      }

      // Test 5: Local Storage
      try {
        localStorage.setItem('diagnostic-test', 'ok');
        const value = localStorage.getItem('diagnostic-test');
        localStorage.removeItem('diagnostic-test');
        results.push({
          timestamp,
          test: 'Local Storage',
          status: value === 'ok' ? 'success' : 'error',
          message: value === 'ok' ? 'Local Storage working' : 'Local Storage failed',
          details: { works: value === 'ok' }
        });
      } catch (error) {
        results.push({
          timestamp,
          test: 'Local Storage',
          status: 'error',
          message: 'Local Storage error',
          details: error
        });
      }

      // Test 6: Environment Info
      results.push({
        timestamp,
        test: 'Environment Info',
        status: 'success',
        message: 'Environment data collected',
        details: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          hostname: window.location.hostname,
          protocol: window.location.protocol,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          screen: `${screen.width}x${screen.height}`,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine
        }
      });

      setDiagnostics(results);
      
      // Log all results to console for debugging
      console.group('🔍 Advanced Diagnostics Results');
      results.forEach(result => {
        const emoji = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`${emoji} ${result.test}: ${result.message}`, result.details);
      });
      console.groupEnd();
    };

    runDiagnostics();

    // Show diagnostics after 2 seconds if there are issues
    const timer = setTimeout(() => {
      const hasErrors = diagnostics.some(d => d.status === 'error');
      if (hasErrors || diagnostics.length === 0) {
        setIsVisible(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show diagnostics on key combination
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm shadow-lg hover:bg-blue-700 transition-colors"
        >
          🔍 Diagnósticos
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-2xl overflow-hidden">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">🔍 Diagnósticos Avançados</h2>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
      
      <div className="p-4 h-full overflow-y-auto">
        <div className="space-y-4">
          {diagnostics.map((result, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 rounded ${
                result.status === 'success' 
                  ? 'border-green-500 bg-green-50' 
                  : result.status === 'warning'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'}
                </span>
                <h3 className="font-semibold">{result.test}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">{result.message}</p>
              {result.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Ver detalhes
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Dicas para resolução:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Se houver erros de rede, verifique sua conexão</li>
            <li>• Se CSS não estiver carregando, limpe o cache do navegador</li>
            <li>• Se React não estiver carregando, tente recarregar a página</li>
            <li>• Use Ctrl+Shift+D para alternar este painel</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
