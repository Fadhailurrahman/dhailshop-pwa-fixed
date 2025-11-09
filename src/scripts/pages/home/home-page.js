import { getStories } from '../../data/api.js';

export default class HomePage {
  constructor() {
    this.listStory = [];
  }

  async render() {
    return `
      <section class="container page-transition" id="home-page" style="padding: 40px 20px;">
        <div style="text-align:center; margin-bottom:50px;">
          <h1 style="color:#1e3a8a; font-size:2rem; margin-bottom:10px;">
            Selamat Datang di <span style="color:#2563eb;">dh@ishop.is</span> 🛒
          </h1>
          <p style="color:#555; font-size:1rem; margin-bottom:25px;">
            Temukan berbagai produk menarik dan cerita dari pengguna kami.
          </p>
          <a href="#/shop" 
            style="
              display:inline-block;
              padding:12px 24px;
              background:#2563eb;
              color:white;
              font-weight:600;
              border-radius:8px;
              text-decoration:none;
              transition: background 0.3s ease;
            "
            onmouseenter="this.style.background='#1e40af';"
            onmouseleave="this.style.background='#2563eb';"
          >
            🛍️ Lihat Produk
          </a>
        </div>

        <h2 style="text-align:center; margin:30px 0; color:#1e3a8a; font-size:1.5rem;">📦 Daftar Produk / Story</h2>
        <div id="story-list" style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center;">
          <p>Memuat produk...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    const storyContainer = document.querySelector('#story-list');
    storyContainer.innerHTML = '';

    if (!token) {
      storyContainer.innerHTML = `
        <div style="text-align:center; padding:40px;">
          <p style="font-size:1rem;">Silakan <a href="#/login" style="color:#2563eb;">login</a> untuk melihat produk.</p>
        </div>
      `;
      return;
    }

    try {
      const { listStory } = await getStories(token);

      if (!listStory || listStory.length === 0) {
        storyContainer.innerHTML = `<p style="color:#777;">Belum ada produk yang ditambahkan.</p>`;
        return;
      }

      listStory.forEach((story) => {
        const name = story.name?.trim() || 'Tanpa Nama';
        const desc = story.description?.trim() || 'Tidak ada deskripsi.';
        const lat = story.lat ?? 'Tidak diketahui';
        const lon = story.lon ?? 'Tidak diketahui';
        const photo = story.photoUrl || 'https://via.placeholder.com/300x150?text=No+Image';

        const card = document.createElement('div');
        card.classList.add('story-card');
        card.style.cssText = `
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:16px;
          width:260px;
          background:#fff;
          box-shadow:0 3px 10px rgba(0,0,0,0.08);
          text-align:center;
          transition:transform 0.2s, box-shadow 0.2s;
        `;

        card.onmouseenter = () => {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
        };

        card.onmouseleave = () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '0 3px 10px rgba(0,0,0,0.08)';
        };

        card.innerHTML = `
          <img src="${photo}" alt="${name}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:10px;" />
          <h3 style="margin:5px 0; color:#1e3a8a;">${name}</h3>
          <p style="font-size:14px; color:#555; min-height:40px;">${desc}</p>
          <p style="font-size:12px; color:#888;">Lat: ${lat}, Lon: ${lon}</p>
        `;

        storyContainer.appendChild(card);
      });
    } catch (err) {
      console.error('❌ Gagal menampilkan story:', err);
      storyContainer.innerHTML = `
        <div style="text-align:center; color:red;">
          <p>Gagal memuat produk. Coba refresh halaman.</p>
        </div>
      `;
    }
  }
}
