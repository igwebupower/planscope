/**
 * IndexedDB caching service for planning data
 * Provides TTL-based caching to reduce API calls and enable offline support
 */

import type { PlanningResponse } from '../types';

const DB_NAME = 'planscope-cache';
const DB_VERSION = 1;
const STORE_NAME = 'planning-data';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  key: string;
  data: PlanningResponse;
  timestamp: number;
  ttl: number;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB connection
 */
async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open cache database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Generate cache key from coordinates and radius
 */
export function generateCacheKey(lat: number, lng: number, radiusM: number): string {
  // Round coordinates to 4 decimal places (~11m precision) for cache hits
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  return `${roundedLat},${roundedLng},${radiusM}`;
}

/**
 * Get cached planning data
 */
export async function getCachedData(key: string): Promise<PlanningResponse | null> {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;

        if (!entry) {
          resolve(null);
          return;
        }

        // Check if entry has expired
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
          // Entry expired, delete it
          deleteFromCache(key).catch(console.error);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };
    });
  } catch (error) {
    console.warn('Cache read failed:', error);
    return null;
  }
}

/**
 * Store planning data in cache
 */
export async function setCachedData(
  key: string,
  data: PlanningResponse,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<void> {
  try {
    const db = await getDB();

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Cache write failed:', error);
  }
}

/**
 * Delete entry from cache
 */
export async function deleteFromCache(key: string): Promise<void> {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Cache delete failed:', error);
  }
}

/**
 * Clear all expired entries from cache
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const db = await getDB();
    const now = Date.now();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.openCursor();

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

        if (cursor) {
          const entry = cursor.value as CacheEntry;
          if (now - entry.timestamp > entry.ttl) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
    });
  } catch (error) {
    console.warn('Cache cleanup failed:', error);
    return 0;
  }
}

/**
 * Clear entire cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Cache clear failed:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{ count: number; oldestTimestamp: number | null }> {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const countRequest = store.count();

      let count = 0;
      let oldestTimestamp: number | null = null;

      countRequest.onsuccess = () => {
        count = countRequest.result;
      };

      const cursorRequest = store.index('timestamp').openCursor();
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          oldestTimestamp = cursor.value.timestamp;
        }
      };

      transaction.oncomplete = () => {
        resolve({ count, oldestTimestamp });
      };

      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn('Cache stats failed:', error);
    return { count: 0, oldestTimestamp: null };
  }
}

/**
 * Check if cache is available (IndexedDB supported)
 */
export function isCacheAvailable(): boolean {
  return typeof indexedDB !== 'undefined';
}
