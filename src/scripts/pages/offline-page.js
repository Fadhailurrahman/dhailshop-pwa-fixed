import { IDBHelper } from '../utils/indexedDB-helper.js';

class OfflinePage {
  constructor() {
    this.db = new IDBHelper();
  }

  async render() {
    return `
      <section class="offline-section container">
        <h2>📦 Data Offline — dh@'ilShop.id</h2>
        <form id="offline-form">
          <input type="text" id="offline-title" placeholder="Nama toko / item..." required />
          <button type="submit" class="btn-primary">Tambah</button>
        </form>
        <ul id="offline-list" class="offline-list"></ul>
      </section>
    `;
  }

  async afterRender() {
    await this.db.dbPromise;

    const form = document.querySelector('#offline-form');
    const input = document.querySelector('#offline-title');
    const list = document.querySelector('#offline-list');

    const renderList = async () => {
      const items = await this.db.getAllItems();
      if (!items.length) {
        list.innerHTML = '<li class="empty">Belum ada data offline.</li>';
        return;
      }

      list.innerHTML = items
        .map(
          (item) => `
        <li data-id="${item.id}">
          <span>${item.title}</span>
          <div>
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">🗑️</button>
          </div>
        </li>
      `
        )
        .join('');
    };

    await renderList();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = input.value.trim();
      if (!title) return;
      await this.db.addItem({ title });
      input.value = '';
      await renderList();
    });

    list.addEventListener('click', async (e) => {
      const li = e.target.closest('li');
      if (!li) return;
      const id = Number(li.dataset.id);

      if (e.target.classList.contains('delete-btn')) {
        await this.db.deleteItem(id);
        await renderList();
      }

      if (e.target.classList.contains('edit-btn')) {
        const newTitle = prompt('Edit item:', li.querySelector('span').textContent);
        if (newTitle) {
          await this.db.updateItem(id, { title: newTitle });
          await renderList();
        }
      }
    });
  }
}

export default OfflinePage;
