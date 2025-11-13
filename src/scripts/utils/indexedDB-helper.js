const DB_NAME = 'dhshop-db';
const DB_VERSION = 5; 
const STORE_NAME = 'shops';
const SAVED_STORE_NAME = 'saved_shops';

export class IDBHelper {
  constructor() {
    this.dbPromise = this.openDB();
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains(SAVED_STORE_NAME)) {
          const savedStore = db.createObjectStore(SAVED_STORE_NAME, { keyPath: 'id', autoIncrement: true });
          savedStore.createIndex('title', 'title', { unique: false });
          savedStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  async getDB() {
    if (!this.dbPromise) this.dbPromise = this.openDB();
    return this.dbPromise;
  }

  // --- Shops store ---
  async addItem(item) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const data = { ...item, timestamp: Date.now() };
      const request = store.add(data);
      request.onsuccess = () => resolve(data);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async getAllItems() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.sort((a,b)=>b.timestamp-a.timestamp));
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async deleteItem(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async searchByTitle(keyword) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('title');
      const results = [];
      const request = index.openCursor();
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.title.toLowerCase().includes(keyword.toLowerCase())) results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // --- Saved store ---
  async addSavedItem(item) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SAVED_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SAVED_STORE_NAME);
      if (!item.id) item.id = Date.now();
      item.id = Number(item.id);
      const data = { ...item, timestamp: Date.now() };
      const request = store.add(data);
      request.onsuccess = () => resolve(data);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async getAllSavedItems() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SAVED_STORE_NAME, 'readonly');
      const store = tx.objectStore(SAVED_STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.sort((a,b)=>b.timestamp-a.timestamp));
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async deleteSavedItem(id) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SAVED_STORE_NAME, 'readwrite');
      const store = tx.objectStore(SAVED_STORE_NAME);
      const request = store.delete(Number(id));
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async searchSavedByTitle(keyword) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SAVED_STORE_NAME, 'readonly');
      const store = tx.objectStore(SAVED_STORE_NAME);
      const index = store.index('title');
      const results = [];
      const request = index.openCursor();
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (cursor.value.title.toLowerCase().includes(keyword.toLowerCase())) results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }
}
