import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { operationQueue } from '@/utils/offlineStorage';
import { SyncService } from '@/services/syncService';
import { Button } from '@/components/ui/button';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkPending = async () => {
    const queue = await operationQueue.getAll();
    setPendingCount(queue.length);
  };

  useEffect(() => {
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      handleSync();
    }
  }, [isOnline, pendingCount]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await SyncService.syncPendingOperations();
      await checkPending();
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 px-4">
      <div className={`mx-auto max-w-md rounded-lg border p-3 shadow-lg ${
        isOnline ? 'bg-primary/10 border-primary' : 'bg-muted border-border'
      }`}>
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-primary" />
          ) : (
            <WifiOff className="h-5 w-5 text-muted-foreground" />
          )}
          
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isOnline ? 'Online' : 'Modo Offline'}
            </p>
            {pendingCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {pendingCount} operação{pendingCount > 1 ? 'ões' : ''} pendente{pendingCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {isOnline && pendingCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSync}
              disabled={isSyncing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
