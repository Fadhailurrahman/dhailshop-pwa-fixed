import { getStories } from '../../data/api.js';
import 'leaflet.markercluster';
import L from 'leaflet';
import { IDBHelper } from '../../utils/indexedDB-helper.js';

export default class ShopPage {
  constructor() {
    this.map = null;
    this.markerGroup = null;
    this.storiesCache = [];
    this.initialized = false;
    this.markersMap = new Map();
  }

  async render() {
    return `
      <section class="container page-transition" id="shop-page">
        <h1 style="text-align:center; margin-bottom:30px; color:#1e3a8a;">🛍️ Toko Produk</h1>

        <div style="text-align:center; margin-bottom:20px;">
          <button id="btn-add-story"
            style="background:#1e3a8a; color:#fff; padding:12px 28px; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:1rem;"
            aria-label="Tambah Produk Baru">
            + Tambah Produk
          </button>
        </div>

        <div id="map" style="height:400px; margin-top:30px; border-radius:12px; overflow:hidden;"></div>
        <p id="map-instruction" style="text-align:center; margin-top:10px; color:#555;">
          🗺️ Klik marker untuk melihat detail atau pilih produk untuk lihat lokasinya
        </p>

        <h2 style="margin:40px 0 20px; text-align:center;">Daftar Produk</h2>
        <div id="products-container"
          style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:20px; justify-content:center; margin-top:10px;">
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) return (window.location.hash = '#/login');

    const container = document.querySelector('#products-container');
    const mapContainer = document.querySelector('#map');
    const addBtn = document.querySelector('#btn-add-story');

    if (!container || !mapContainer) return console.error('Container map atau products tidak ditemukan.');

    if (!this.initialized) {
      this.map = L.map(mapContainer).setView([-2, 118], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      this.markerGroup = L.markerClusterGroup().addTo(this.map);
      this.initialized = true;
    } else {
      this.markerGroup.clearLayers();
      this.map.invalidateSize();
    }

    addBtn.addEventListener('click', () => {
      window.location.hash = '#/shop/add';
    });

    await this.loadProducts();
  }

  async loadProducts() {
    const container = document.querySelector('#products-container');
    const idb = new IDBHelper();
    await idb.dbPromise;

    let data;
    try {
      if (navigator.onLine) {
        const token = localStorage.getItem('token');
        const apiData = await getStories(token);

        await Promise.all(apiData.listStory.map(async (item) => {
          await idb.addItem({
            id: item.id || Date.now(),
            title: item.name || 'Tanpa nama',
            description: item.description || '',
            photo: item.photoUrl || '/images/placeholder.png',
            lat: item.lat ?? null,
            lon: item.lon ?? null,
            createdAt: item.createdAt || new Date().toISOString(),
          });
        }));

        data = {
          listStory: apiData.listStory.map(item => ({
            title: item.name || 'Tanpa nama',
            description: item.description || '',
            photo: item.photoUrl || '/images/placeholder.png',
            lat: item.lat ?? null,
            lon: item.lon ?? null,
            createdAt: item.createdAt || new Date().toISOString(),
          })),
        };
      } else {
        const offlineItems = await idb.getAllItems();
        data = { listStory: offlineItems };
      }
    } catch {
      const offlineItems = await idb.getAllItems();
      data = { listStory: offlineItems };
    }

    this.storiesCache = data?.listStory || [];
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    this.storiesCache.forEach((story, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.id = `product-${index}`;
      card.innerHTML = `
        <img src="${story.photo}" alt="Foto produk ${story.title}" />
        <h3>${story.title}</h3>
        <p>${story.description}</p>
        <p>📅 ${story.createdAt ? new Date(story.createdAt).toLocaleDateString() : ''}</p>
        <div style="display:flex; justify-content:space-between; gap:10px; margin-top:10px;">
          <button class="save-offline">💾 Simpan</button>
          <button class="delete-offline">🗑️ Hapus</button>
        </div>
      `;

      card.querySelector('.delete-offline').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!story.id) return;
        await idb.deleteItem(story.id);
        await this.loadProducts();
      });

      card.querySelector('.save-offline').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!story.title) return;
        await idb.addItem({ ...story });
        await this.loadProducts();
      });

      fragment.appendChild(card);

      if (story.lat != null && story.lon != null) {
        const marker = L.marker([story.lat, story.lon]);
        marker.bindPopup(`<b>${story.title}</b><br>${story.description}`);
        this.markerGroup.addLayer(marker);

        this.markersMap.set(marker._leaflet_id, { story, index, marker });

        marker.on('click', () => {
          const targetCard = document.getElementById(`product-${index}`);
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetCard.style.outline = '3px solid #2563eb';
            setTimeout(() => (targetCard.style.outline = 'none'), 1500);
          }
        });

        card.addEventListener('click', () => {
          this.map.setView([story.lat, story.lon], 12);
          marker.openPopup();
        });
      }
    });

    container.appendChild(fragment);

    const layers = this.markerGroup.getLayers();
    if (layers.length) {
      this.map.fitBounds(new L.featureGroup(layers).getBounds().pad(0.3));
    }
  }
}
