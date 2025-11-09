const DB_NAME = 'dhshop-db';
const DB_VERSION = 1;
const STORE_NAME = 'shops';

export class IDBHelper {
  constructor() {
    this.dbPromise = this.openDB();
  }

  // ✅ Membuka atau upgrade database
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });
  }

  // ✅ Pastikan database selalu siap (reconnect otomatis jika closed)
  async getDB() {
    if (!this.dbPromise) this.dbPromise = this.openDB();
    let db = await this.dbPromise;
    try {
      db.transaction(STORE_NAME, 'readonly'); // test koneksi
    } catch (err) {
      console.warn('🔁 Re-opening IndexedDB (previous connection closed)');
      this.dbPromise = this.openDB();
      db = await this.dbPromise;
    }
    return db;
  }

  // ➕ Tambah data
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

  // 📦 Ambil semua data
  async getAllItems() {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // 🗑️ Hapus data berdasarkan ID
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

  // ✏️ Update data berdasarkan ID
  async updateItem(id, updatedData) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (!data) {
          reject(`❌ Item dengan ID ${id} tidak ditemukan`);
          return;
        }

        const newData = { ...data, ...updatedData, timestamp: Date.now() };
        const updateRequest = store.put(newData);

        updateRequest.onsuccess = () => resolve(newData);
        updateRequest.onerror = (e) => reject(e.target.error);
      };

      getRequest.onerror = (e) => reject(e.target.error);
    });
  }

  // 🔍 Cari berdasarkan title (case-insensitive)
  async searchByTitle(keyword) {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('title');
      const results = [];

      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const value = cursor.value;
          if (
            value.title &&
            value.title.toLowerCase().includes(keyword.toLowerCase())
          ) {
            results.push(value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = (e) => reject(e.target.error);
    });
  }
}
