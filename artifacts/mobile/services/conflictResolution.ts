import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Conflict {
  id: string;
  entityType: 'member' | 'transaction' | 'organization';
  entityId: string;
  localVersion: any;
  serverVersion: any;
  timestamp: number;
  resolved: boolean;
}

export interface ConflictResolution {
  strategy: 'local' | 'server' | 'merge';
  mergedData?: any;
}

const CONFLICTS_KEY = '@bossin_conflicts';

class ConflictResolutionService {
  private conflicts: Conflict[] = [];

  async loadConflicts() {
    try {
      const stored = await AsyncStorage.getItem(CONFLICTS_KEY);
      if (stored) {
        this.conflicts = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading conflicts:', error);
    }
  }

  async saveConflicts() {
    try {
      await AsyncStorage.setItem(CONFLICTS_KEY, JSON.stringify(this.conflicts));
    } catch (error) {
      console.error('Error saving conflicts:', error);
    }
  }

  async detectConflict(
    entityType: Conflict['entityType'],
    entityId: string,
    localVersion: any,
    serverVersion: any
  ): Promise<boolean> {
    // Simple conflict detection: check if versions differ
    const isDifferent = JSON.stringify(localVersion) !== JSON.stringify(serverVersion);
    
    if (isDifferent) {
      const conflict: Conflict = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        entityType,
        entityId,
        localVersion,
        serverVersion,
        timestamp: Date.now(),
        resolved: false,
      };
      
      this.conflicts.push(conflict);
      await this.saveConflicts();
      return true;
    }
    
    return false;
  }

  async resolveConflict(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<void> {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    conflict.resolved = true;
    await this.saveConflicts();

    // Remove resolved conflicts after a delay
    setTimeout(() => {
      this.conflicts = this.conflicts.filter(c => c.id !== conflictId);
      this.saveConflicts();
    }, 60000); // Remove after 1 minute
  }

  getConflicts(): Conflict[] {
    return this.conflicts.filter(c => !c.resolved);
  }

  getConflictById(id: string): Conflict | undefined {
    return this.conflicts.find(c => c.id === id);
  }

  async clearConflicts(): Promise<void> {
    this.conflicts = [];
    await this.saveConflicts();
  }

  // Automatic conflict resolution strategies
  autoResolveConflict(localVersion: any, serverVersion: any): ConflictResolution {
    // Strategy 1: If server version is newer, use server
    if (serverVersion.updated_at && localVersion.updated_at) {
      if (new Date(serverVersion.updated_at) > new Date(localVersion.updated_at)) {
        return { strategy: 'server' };
      }
      if (new Date(localVersion.updated_at) > new Date(serverVersion.updated_at)) {
        return { strategy: 'local' };
      }
    }

    // Strategy 2: For numeric fields, use the higher value
    if (typeof localVersion === 'number' && typeof serverVersion === 'number') {
      return {
        strategy: 'merge',
        mergedData: Math.max(localVersion, serverVersion),
      };
    }

    // Strategy 3: For arrays, merge them
    if (Array.isArray(localVersion) && Array.isArray(serverVersion)) {
      return {
        strategy: 'merge',
        mergedData: [...new Set([...localVersion, ...serverVersion])],
      };
    }

    // Default: prefer local version (user's changes)
    return { strategy: 'local' };
  }

  // Merge strategy for specific entity types
  mergeMemberData(local: any, server: any): any {
    return {
      ...server,
      // Keep local changes for these fields
      name: local.name || server.name,
      phone: local.phone || server.phone,
      email: local.email || server.email,
      // Use server's financial data
      pledge: server.pledge,
      paid_total: server.paid_total,
      remaining: server.remaining,
    };
  }

  mergeTransactionData(local: any, server: any): any {
    return {
      ...server,
      // Keep local changes for these fields
      note: local.note || server.note,
      // Use server's financial data
      amount: server.amount,
      date: server.date,
    };
  }
}

// Export singleton instance
export const conflictResolutionService = new ConflictResolutionService();

// Export for testing
export { ConflictResolutionService };
