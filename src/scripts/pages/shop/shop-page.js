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
            style="background:#1e3a8a; color:#fff; padding:10px 25px; border:none; border-radius:8px; cursor:pointer; font-weight:600; width:200px;"
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
    if (!container || !mapContainer) return console.error('❌ Container map atau products tidak ditemukan.');

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

    const idb = new IDBHelper();
    await idb.dbPromise; 
    let data;

    try {
      if (navigator.onLine) {
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
    } catch (err) {
      console.error('❌ Gagal mengambil produk:', err);
      const offlineItems = await idb.getAllItems();
      data = { listStory: offlineItems };
    }

    this.storiesCache = data?.listStory || [];
    this.markersMap.clear();
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    this.storiesCache.forEach((story, index) => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.id = `product-${index}`;
      card.style.cssText = `
        border:1px solid #e5e7eb;
        border-radius:12px;
        background:#fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.08);
        padding:14px;
        transition:transform 0.2s, box-shadow 0.2s;
        cursor:pointer;
      `;

      card.innerHTML = `
        <img src="${story.photo}" alt="Foto produk ${story.title}" 
             style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:10px;" />
        <h3 style="color:#1e3a8a; margin-bottom:6px;">${story.title}</h3>
        <p style="font-size:14px; color:#444; min-height:40px;">${story.description}</p>
        <p style="font-size:12px; color:#666;">📅 ${story.createdAt ? new Date(story.createdAt).toLocaleDateString() : ''}</p>
      `;

      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
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
            targetCard.style.transition = 'outline 0.3s';
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
