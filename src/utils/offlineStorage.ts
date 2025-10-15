import localforage from 'localforage';

// Configure localforage
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'agroikemba-rep',
  version: 1.0,
  storeName: 'offline_cache',
});

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const offlineStorage = {
  async set<T>(key: string, data: T, ttl: number = CACHE_DURATION): Promise<void> {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    await localforage.setItem(key, cached);
  },

  async get<T>(key: string): Promise<T | null> {
    const cached = await localforage.getItem<CachedData<T>>(key);
    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      await localforage.removeItem(key);
      return null;
    }

    return cached.data;
  },

  async getStale<T>(key: string): Promise<T | null> {
    const cached = await localforage.getItem<CachedData<T>>(key);
    return cached ? cached.data : null;
  },

  async remove(key: string): Promise<void> {
    await localforage.removeItem(key);
  },

  async clear(): Promise<void> {
    await localforage.clear();
  },

  async getAllKeys(): Promise<string[]> {
    return await localforage.keys();
  },
};

// Queue for pending operations
export interface PendingOperation {
  id: string;
  type: 'opportunity' | 'client';
  data: any;
  timestamp: number;
  retries: number;
}

const PENDING_QUEUE_KEY = 'pending_operations_queue';

export const operationQueue = {
  async add(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const queue = await this.getAll();
    const newOperation: PendingOperation = {
      ...operation,
      id: `${operation.type}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retries: 0,
    };
    queue.push(newOperation);
    await localforage.setItem(PENDING_QUEUE_KEY, queue);
    return newOperation.id;
  },

  async getAll(): Promise<PendingOperation[]> {
    const queue = await localforage.getItem<PendingOperation[]>(PENDING_QUEUE_KEY);
    return queue || [];
  },

  async remove(id: string): Promise<void> {
    const queue = await this.getAll();
    const filtered = queue.filter(op => op.id !== id);
    await localforage.setItem(PENDING_QUEUE_KEY, filtered);
  },

  async incrementRetry(id: string): Promise<void> {
    const queue = await this.getAll();
    const operation = queue.find(op => op.id === id);
    if (operation) {
      operation.retries++;
      await localforage.setItem(PENDING_QUEUE_KEY, queue);
    }
  },

  async clear(): Promise<void> {
    await localforage.setItem(PENDING_QUEUE_KEY, []);
  },
};
