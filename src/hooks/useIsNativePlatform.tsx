/**
 * Hook para detectar se está rodando em plataforma nativa (Capacitor)
 * Usa verificação de protocolo para detecção instantânea e confiável
 */
export function useIsNativePlatform(): boolean {
  return window.location.protocol === 'capacitor:';
}
