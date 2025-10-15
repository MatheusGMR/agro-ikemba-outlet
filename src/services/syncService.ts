import { operationQueue, PendingOperation } from '@/utils/offlineStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MAX_RETRIES = 3;

export class SyncService {
  private static isSyncing = false;

  static async syncPendingOperations(): Promise<void> {
    if (this.isSyncing) return;
    
    this.isSyncing = true;
    const queue = await operationQueue.getAll();
    
    if (queue.length === 0) {
      this.isSyncing = false;
      return;
    }

    console.log(`[SyncService] Syncing ${queue.length} pending operations`);
    
    let successCount = 0;
    let failCount = 0;

    for (const operation of queue) {
      try {
        await this.processOperation(operation);
        await operationQueue.remove(operation.id);
        successCount++;
      } catch (error) {
        console.error(`[SyncService] Failed to sync operation ${operation.id}:`, error);
        
        if (operation.retries >= MAX_RETRIES) {
          console.error(`[SyncService] Max retries reached for ${operation.id}, removing from queue`);
          await operationQueue.remove(operation.id);
          failCount++;
        } else {
          await operationQueue.incrementRetry(operation.id);
        }
      }
    }

    this.isSyncing = false;

    if (successCount > 0) {
      toast.success(`${successCount} operações sincronizadas com sucesso`);
    }
    
    if (failCount > 0) {
      toast.error(`${failCount} operações falhou após múltiplas tentativas`);
    }
  }

  private static async processOperation(operation: PendingOperation): Promise<void> {
    switch (operation.type) {
      case 'opportunity':
        await this.syncOpportunity(operation.data);
        break;
      case 'client':
        await this.syncClient(operation.data);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  private static async syncOpportunity(data: any): Promise<void> {
    const { error: oppError } = await supabase
      .from('opportunities')
      .insert({
        representative_id: data.representative_id,
        client_id: data.client_id,
        title: data.title,
        description: data.description,
        stage: data.stage,
        estimated_value: data.estimated_value,
        estimated_commission: data.estimated_commission,
        status: 'active',
      })
      .select()
      .single();

    if (oppError) throw oppError;

    if (data.items && data.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('opportunity_items')
        .insert(data.items);

      if (itemsError) throw itemsError;
    }
  }

  private static async syncClient(data: any): Promise<void> {
    const { error } = await supabase
      .from('rep_clients')
      .insert(data);

    if (error) throw error;
  }
}
