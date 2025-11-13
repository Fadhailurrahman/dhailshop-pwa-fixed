import { IDBHelper } from '../utils/indexedDB-helper.js';

class SaveProductPage {
  constructor() {
    this.db = new IDBHelper();
  }

  async render() {
    return `
      <section class="saved-products-section container">
        <h2>💾 Produk Tersimpan</h2>
        <input type="text" id="search-input" placeholder="🔍 Cari produk tersimpan..." 
          style="margin-bottom:20px; padding:8px 12px; width:100%; max-width:400px;" />
        <ul id="saved-products-list" class="saved-products-list" style="list-style:none; padding:0;"></ul>
      </section>
    `;
  }

  async afterRender() {
    const list = document.querySelector('#saved-products-list');
    const searchInput = document.querySelector('#search-input');

    const renderList = async (keyword = '') => {
      const items = keyword
        ? await this.db.searchSavedByTitle(keyword)
        : await this.db.getAllSavedItems();

      if (!items.length) {
        list.innerHTML = '<li class="empty" style="padding:10px; color:#555;">Belum ada produk tersimpan.</li>';
        return;
      }

      list.innerHTML = items
        .map(
          (item) => `
          <li data-id="${item.id}" style="border:1px solid #ddd; border-radius:8px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>${item.title}</strong>
              <p style="margin:4px 0; font-size:0.9rem; color:#555;">${item.description || ''}</p>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="delete-btn" style="padding:4px 8px; cursor:pointer;">🗑️ Hapus</button>
            </div>
          </li>
        `
        )
        .join('');
    };

    await renderList();

    list.addEventListener('click', async (e) => {
      const li = e.target.closest('li');
      if (!li) return;

      const id = Number(li.dataset.id);
      if (!id && id !== 0) return console.error('ID tidak valid untuk dihapus:', li.dataset.id);

      if (e.target.classList.contains('delete-btn')) {
        try {
          await this.db.deleteSavedItem(id);
          await renderList();
          alert('🗑️ Produk berhasil dihapus dari tersimpan.');
        } catch (err) {
          console.error('Gagal menghapus item:', err);
        }
      }
    });

    searchInput.addEventListener('input', async (e) => {
      await renderList(e.target.value.trim());
    });
  }
}

export default SaveProductPage;
