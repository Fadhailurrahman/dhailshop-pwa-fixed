import { addStory } from '../data/api.js';
import { IDBHelper } from './indexedDB-helper.js';

export async function syncOfflineData() {
  const idb = new IDBHelper();
  const items = await idb.getAllItems();
  const token = localStorage.getItem('token');

  if (!token || !items.length) return;

  for (const item of items) {
    try {
      const formData = new FormData();
      formData.append('description', item.description);
      if (item.photo) {
        const blob = await (await fetch(item.photo)).blob();
        formData.append('photo', blob, 'photo.jpg');
      }
      if (item.lat) formData.append('lat', item.lat);
      if (item.lon) formData.append('lon', item.lon);

      const result = await addStory(token, formData);
      if (!result.error) {
        await idb.deleteItem(item.id); 
        console.log(`✅ Sinkron sukses untuk item: ${item.title}`);
      }
    } catch (err) {
      console.warn(`❌ Gagal sinkron ${item.title}:`, err);
    }
  }
}

window.addEventListener('online', () => {
  console.log('🌐 Online lagi — mulai sinkronisasi data...');
  syncOfflineData();
});
