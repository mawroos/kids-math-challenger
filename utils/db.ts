// Durable key-value storage backed by IndexedDB, which survives browser/tablet
// restarts far more reliably than localStorage alone (higher quota, not wiped
// under the same low-storage eviction heuristics). Paired with
// requestPersistentStorage() to ask Chrome not to evict this origin's data at all.

const DB_NAME = 'kids-math-challenger';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

let dbPromise: Promise<IDBDatabase> | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Don't cache a rejected open attempt — allow future calls to retry.
  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
};

export const idbGet = async <T>(key: string): Promise<T | undefined> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
};

export const idbSet = async (key: string, value: unknown): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const idbDelete = async (key: string): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// Reads and writes a key within a single readwrite transaction so concurrent
// callers (e.g. rapid answer updates) can't interleave and clobber each other.
// If `mutate` returns undefined, the write is skipped and the current value
// (possibly still undefined) is returned as-is.
export const idbAtomicUpdate = async <T>(
  key: string,
  mutate: (current: T | undefined) => T | undefined
): Promise<T | undefined> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(key);

    getRequest.onsuccess = () => {
      const current = getRequest.result as T | undefined;
      const next = mutate(current);
      if (next === undefined) {
        tx.oncomplete = () => resolve(current);
        return;
      }
      store.put(next, key);
      tx.oncomplete = () => resolve(next);
    };
    getRequest.onerror = () => reject(getRequest.error);
    tx.onerror = () => reject(tx.error);
  });
};

// Asks the browser to move this origin into the "persistent" storage bucket so
// Chrome won't silently clear it under disk-pressure eviction. Best-effort:
// Chrome grants this based on site engagement heuristics, with no user prompt.
export const requestPersistentStorage = async (): Promise<boolean> => {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const alreadyPersisted = await navigator.storage.persisted?.();
      if (alreadyPersisted) return true;
      return await navigator.storage.persist();
    }
  } catch (error) {
    console.warn('Failed to request persistent storage:', error);
  }
  return false;
};
