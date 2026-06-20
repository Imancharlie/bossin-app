import { offlineQueue, OfflineQueueStatus, QueuedRequest } from './offlineQueue';
import { apiClient } from './apiClient';

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  currentOperation: string;
}

export interface SyncResult {
  success: boolean;
  completed: number;
  failed: number;
  errors: string[];
}

class SyncService {
  private isSyncing: boolean = false;
  private progress: SyncProgress = {
    total: 0,
    completed: 0,
    failed: 0,
    currentOperation: '',
  };
  private listeners: Set<(progress: SyncProgress) => void> = new Set();

  constructor() {
    // Subscribe to offline queue status changes
    offlineQueue.subscribe(this.handleQueueStatusChange.bind(this));
  }

  private handleQueueStatusChange(status: OfflineQueueStatus) {
    if (status.isOnline && status.queueLength > 0 && !this.isSyncing) {
      this.startSync();
    }
  }

  subscribe(listener: (progress: SyncProgress) => void) {
    this.listeners.add(listener);
    listener(this.progress);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.progress));
  }

  getProgress(): SyncProgress {
    return { ...this.progress };
  }

  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  async startSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        completed: 0,
        failed: 0,
        errors: ['Sync already in progress'],
      };
    }

    const queue = offlineQueue.getQueue();
    if (queue.length === 0) {
      return {
        success: true,
        completed: 0,
        failed: 0,
        errors: [],
      };
    }

    this.isSyncing = true;
    this.progress = {
      total: queue.length,
      completed: 0,
      failed: 0,
      currentOperation: 'Starting synchronization...',
    };
    this.notifyListeners();

    const errors: string[] = [];

    for (let i = 0; i < queue.length; i++) {
      const request = queue[i];
      this.progress.currentOperation = `Processing ${request.method} ${request.endpoint}`;
      this.notifyListeners();

      try {
        await this.executeRequest(request);
        await offlineQueue.removeRequest(request.id);
        this.progress.completed++;
      } catch (error) {
        this.progress.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${request.method} ${request.endpoint}: ${errorMessage}`);
        
        // Increment retry count
        request.retryCount++;
        
        if (request.retryCount >= request.maxRetries) {
          await offlineQueue.removeRequest(request.id);
        }
      }

      this.notifyListeners();
    }

    this.isSyncing = false;
    this.progress.currentOperation = 'Synchronization complete';
    this.notifyListeners();

    return {
      success: errors.length === 0,
      completed: this.progress.completed,
      failed: this.progress.failed,
      errors,
    };
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    switch (request.method) {
      case 'GET':
        await apiClient.get(request.endpoint, request.params);
        break;
      case 'POST':
        await apiClient.post(request.endpoint, request.data);
        break;
      case 'PUT':
        await apiClient.put(request.endpoint, request.data);
        break;
      case 'PATCH':
        await apiClient.patch(request.endpoint, request.data);
        break;
      case 'DELETE':
        await apiClient.delete(request.endpoint);
        break;
    }
  }

  async syncNow(): Promise<SyncResult> {
    return this.startSync();
  }

  async clearQueue(): Promise<void> {
    await offlineQueue.clearQueue();
    this.progress = {
      total: 0,
      completed: 0,
      failed: 0,
      currentOperation: '',
    };
    this.notifyListeners();
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Export for testing
export { SyncService };
