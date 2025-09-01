import { useEffect } from 'react';
import { hardLogout } from '@/utils/logout';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

/**
 * Dedicated logout page that executes the logout process
 * This ensures logout works even if onClick handlers fail
 */
export default function Logout() {
  useEffect(() => {
    // Execute logout immediately when this page loads
    hardLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingFallback />
        <p className="mt-4 text-muted-foreground">Fazendo logout...</p>
      </div>
    </div>
  );
}