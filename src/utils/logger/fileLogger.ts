/**
 * File Logger for Browser Environment
 * Logs are stored in IndexedDB and can be downloaded as files
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  flow: string;
  message: string;
  data?: any;
}

class FileLogger {
  private dbName = 'evena_logs';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init() {
    if (typeof window === 'undefined') return;

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for different flows
        const flows = ['auth', 'event', 'order', 'payment', 'api', 'general'];

        flows.forEach(flow => {
          if (!db.objectStoreNames.contains(flow)) {
            const store = db.createObjectStore(flow, { keyPath: 'id', autoIncrement: true });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('level', 'level', { unique: false });
          }
        });
      };
    });
  }

  private async ensureDb() {
    if (!this.db) {
      await this.init();
    }
  }

  async log(flow: string, level: LogEntry['level'], message: string, data?: any) {
    if (typeof window === 'undefined') return;

    try {
      await this.ensureDb();
      if (!this.db) return;

      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        flow,
        message,
        data: data ? JSON.parse(JSON.stringify(data)) : undefined,
      };

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        const consoleMethod = level === 'error' ? console.error :
                            level === 'warn' ? console.warn :
                            level === 'debug' ? console.debug :
                            console.log;
        consoleMethod(`[${flow.toUpperCase()}]`, message, data || '');
      }

      const transaction = this.db.transaction([flow], 'readwrite');
      const store = transaction.objectStore(flow);
      await store.add(entry);

      // Clean old logs (keep last 1000 entries per flow)
      this.cleanOldLogs(flow);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  private async cleanOldLogs(flow: string) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([flow], 'readwrite');
      const store = transaction.objectStore(flow);
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const count = countRequest.result;
        if (count > 1000) {
          const deleteCount = count - 1000;
          const cursorRequest = store.openCursor();
          let deleted = 0;

          cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor && deleted < deleteCount) {
              cursor.delete();
              deleted++;
              cursor.continue();
            }
          };
        }
      };
    } catch (error) {
      console.error('Failed to clean logs:', error);
    }
  }

  async getLogs(flow: string, limit: number = 100): Promise<LogEntry[]> {
    if (typeof window === 'undefined') return [];

    await this.ensureDb();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([flow], 'readonly');
      const store = transaction.objectStore(flow);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Reverse order (newest first)

      const logs: LogEntry[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < limit) {
          logs.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(logs);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async downloadLogs(flow: string) {
    const logs = await this.getLogs(flow, 1000);
    const logText = logs.map(log =>
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flow}-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async clearLogs(flow: string) {
    if (!this.db) return;

    const transaction = this.db.transaction([flow], 'readwrite');
    const store = transaction.objectStore(flow);
    await store.clear();
  }
}

export const fileLogger = new FileLogger();

// Initialize on import
if (typeof window !== 'undefined') {
  fileLogger.init();
}
