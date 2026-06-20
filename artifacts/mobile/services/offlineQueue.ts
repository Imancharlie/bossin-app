import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface QueuedRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  params?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineQueueStatus {
  isOnline: boolean;
  queueLength: number;
  isProcessing: boolean;
}

const QUEUE_KEY = '@bossin_offline_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isProcessing: boolean = false;
  private isOnline: boolean = true;
  private listeners: Set<(status: OfflineQueueStatus) => void> = new Set();

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.loadQueue();
    await this.checkConnection();
    
    // Listen for network changes
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
      this.notifyListeners();
      
      if (this.isOnline && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }

  private async loadQueue() {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }

  private async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  private async checkConnection() {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    this.notifyListeners();
  }

  private notifyListeners() {
    const status: OfflineQueueStatus = {
      isOnline: this.isOnline,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
    };
    this.listeners.forEach(listener => listener(status));
  }

  subscribe(listener: (status: OfflineQueueStatus) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStatus(): OfflineQueueStatus {
    return {
      isOnline: this.isOnline,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }

  async addRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data?: any,
    params?: any
  ): Promise<string> {
    const request: QueuedRequest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      endpoint,
      method,
      data,
      params,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRIES,
    };

    this.queue.push(request);
    await this.saveQueue();
    this.notifyListeners();

    // If online, try to process immediately
    if (this.isOnline && !this.isProcessing) {
      this.processQueue();
    }

    return request.id;
  }

  async removeRequest(id: string): Promise<void> {
    this.queue = this.queue.filter(req => req.id !== id);
    await this.saveQueue();
    this.notifyListeners();
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    this.notifyListeners();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || !this.isOnline) {
      return;
    }

    this.isProcessing = true;
    this.notifyListeners();

    while (this.queue.length > 0 && this.isOnline) {
      const request = this.queue[0];
      
      try {
        await this.executeRequest(request);
        // Success: remove from queue
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        // Failure: increment retry count
        request.retryCount++;
        
        if (request.retryCount >= request.maxRetries) {
          // Max retries reached: remove from queue
          console.error(`Request failed after ${request.maxRetries} retries:`, request.endpoint);
          this.queue.shift();
        } else {
          // Move to end of queue and retry later
          this.queue.shift();
          this.queue.push(request);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
        
        await this.saveQueue();
      }
    }

    this.isProcessing = false;
    this.notifyListeners();
  }

  private async executeRequest(request: QueuedRequest): Promise<void> {
    // This will be implemented by the API client
    // For now, this is a placeholder
    const { apiClient } = require('./apiClient');
    
    let response;
    switch (request.method) {
      case 'GET':
        response = await apiClient.get(request.endpoint, request.params);
        break;
      case 'POST':
        response = await apiClient.post(request.endpoint, request.data);
        break;
      case 'PUT':
        response = await apiClient.put(request.endpoint, request.data);
        break;
      case 'PATCH':
        response = await apiClient.patch(request.endpoint, request.data);
        break;
      case 'DELETE':
        response = await apiClient.delete(request.endpoint);
        break;
    }
    
    return response;
  }

  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();

// Export for testing
export { OfflineQueue };
