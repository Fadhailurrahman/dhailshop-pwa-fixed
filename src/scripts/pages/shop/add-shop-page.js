import { addStory } from '../../data/api.js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { IDBHelper } from '../../utils/indexedDB-helper.js';

export default class AddShopPage {
  constructor() {
    this.map = null;
    this.marker = null;
  }

  async render() {
    return `
      <section class="container page-transition" id="add-shop-page" style="padding:40px 20px;">
        <h1 style="text-align:center; margin-bottom:30px; color:#1e3a8a;">➕ Tambah Produk Baru</h1>

        <form id="story-form" style="max-width:600px; margin:0 auto; display:flex; flex-direction:column; gap:15px;">
          <label for="title" style="text-align:left;">Judul Produk</label>
          <input type="text" id="title" placeholder="Judul Produk" required style="padding:10px; border:1px solid #ccc; border-radius:6px;" />

          <label for="body" style="text-align:left;">Deskripsi Produk</label>
          <textarea id="body" placeholder="Deskripsi Produk" rows="4" required style="padding:10px; border:1px solid #ccc; border-radius:6px;"></textarea>

          <label for="photo" style="text-align:left;">Foto Produk</label>
          <input type="file" id="photo" accept="image/*" required style="padding:6px; border:1px solid #ccc; border-radius:6px;" />

          <label for="lat" style="text-align:left;">Latitude</label>
          <input type="number" step="any" id="lat" placeholder="Klik di peta atau isi manual" style="padding:10px; border:1px solid #ccc; border-radius:6px;" />

          <label for="lon" style="text-align:left;">Longitude</label>
          <input type="number" step="any" id="lon" placeholder="Klik di peta atau isi manual" style="padding:10px; border:1px solid #ccc; border-radius:6px;" />

          <p style="font-size:0.9rem; color:#555; margin-top:-5px; text-align:left;">
            🗺️ Kamu bisa klik di peta di bawah untuk memilih lokasi produk.
          </p>

          <div style="display:flex; justify-content:center; gap:10px; margin-top:10px;">
            <button type="submit" style="padding:10px 18px; background:#2563eb; color:white; border:none; border-radius:8px; cursor:pointer;">
              Tambah Produk
            </button>
            <button type="button" id="btn-cancel" style="padding:10px 18px; background:#e5e7eb; border:none; border-radius:8px; cursor:pointer;">
              Batal
            </button>
          </div>
        </form>

        <div id="map" style="height:350px; width:100%; max-width:600px; margin:30px auto; border-radius:8px; overflow:hidden; border:1px solid #ddd;"></div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) return (window.location.hash = '#/login');

    const form = document.querySelector('#story-form');
    const cancelBtn = document.querySelector('#btn-cancel');
    const latInput = document.querySelector('#lat');
    const lonInput = document.querySelector('#lon');

    cancelBtn.addEventListener('click', () => (window.location.hash = '#/shop'));

    this.map = L.map('map').setView([-2, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    [latInput, lonInput].forEach((input) => {
      input.addEventListener('input', () => {
        const lat = parseFloat(latInput.value);
        const lon = parseFloat(lonInput.value);
        if (!isNaN(lat) && !isNaN(lon)) {
          if (this.marker) this.marker.setLatLng([lat, lon]);
          else this.marker = L.marker([lat, lon]).addTo(this.map);
          this.map.setView([lat, lon], 12);
        }
      });
    });

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      latInput.value = lat.toFixed(6);
      lonInput.value = lng.toFixed(6);

      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      } else {
        this.marker = L.marker([lat, lng]).addTo(this.map);
      }

      this.map.setView([lat, lng], 12);
    });

    const idb = new IDBHelper();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.querySelector('#title').value.trim();
      const body = document.querySelector('#body').value.trim();
      const photoFile = document.querySelector('#photo').files[0];
      const lat = latInput.value.trim();
      const lon = lonInput.value.trim();

      if (!title || !body || !photoFile) {
        return alert('Judul, deskripsi, dan foto wajib diisi!');
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const photoBase64 = reader.result;

        const item = {
          title,
          description: body,
          photo: photoBase64,
          lat: parseFloat(lat) || null,
          lon: parseFloat(lon) || null,
        };

        try {
          await idb.addItem(item);
          console.log('✅ Produk tersimpan offline');
        } catch (err) {
          console.error('❌ Gagal menyimpan offline:', err);
        }
      };
      reader.readAsDataURL(photoFile);

      if (navigator.onLine) {
        const formData = new FormData();
        formData.append('description', body);
        formData.append('photo', photoFile);
        if (lat) formData.append('lat', lat);
        if (lon) formData.append('lon', lon);

        try {
          const result = await addStory(token, formData);
          if (!result.error) console.log('✅ Produk dikirim ke server');
        } catch (err) {
          console.warn('❌ Gagal sinkron ke server, tetap tersimpan offline.');
        }
      }

      alert('Produk berhasil diproses!');
      form.reset();
    });
  }
}
