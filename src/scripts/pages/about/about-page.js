import PushHelper from '../../utils/push-helper.js';

export default class AboutPage {
  async render() {
    return `
      <section class="container" style="padding:50px 0;">

        <div style="text-align:center; margin-bottom:40px;">
          <img src="/images/logo.png" alt="Logo dh@'ilShop.id" style="width:120px; height:auto;" />
          <h1 style="margin-top:20px; font-size:2rem; color:#1e3a8a;">dh@'ilShop.id</h1>
          <p style="margin-top:10px; color:#555; font-size:1.125rem;">
            Anda Males Keluar Rumah, Tapi Punya Segudang Kebutuhan? Tenang Beli Di Kami Saja!
          </p>
        </div>

        <div style="margin-bottom:40px;">
          <h2 style="font-size:1.5rem; color:#1e3a8a; margin-bottom:15px;">Misi Kami</h2>
          <ul style="list-style: disc; padding-left:20px; color:#555;">
            <li>Menyediakan produk kebutuhan masyarakat</li>
            <li>Memberikan pengalaman pelayanan digital terbaik</li>
            <li>Siap memenuhi kebutuhan pelanggan</li>
          </ul>
        </div>

        <div style="margin-bottom:40px;">
          <h2 style="font-size:1.5rem; color:#1e3a8a; margin-bottom:15px;">Kontak Kami</h2>
          <p style="color:#555; margin-bottom:5px;">Email: dh@'ilShop.id</p>
          <p style="color:#555; margin-bottom:5px;">Telepon: +62 812 3456 7890</p>
          <p style="color:#555; margin-bottom:5px;">Alamat: Jl. Pak Sakera Guluk-Guluk Sumenep Madura</p>
        </div>

        <!-- ✅ Tombol Toggle Notifikasi -->
        <div style="text-align:center; margin-top:50px;">
          <button 
            id="toggle-notif"
            style="
              background:#2563eb;
              color:white;
              padding:12px 24px;
              border:none;
              border-radius:8px;
              cursor:pointer;
              font-size:1rem;
              font-weight:600;
              transition: background 0.3s ease;
            "
            onmouseenter="this.style.background='#1e40af';"
            onmouseleave="this.style.background='#2563eb';"
          >
            🔔 Aktifkan Notifikasi
          </button>
        </div>

      </section>
    `;
  }

  async afterRender() {
    const btn = document.querySelector('#toggle-notif');
    if (!('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      btn.textContent = '🔕 Nonaktifkan Notifikasi';
      btn.dataset.active = 'true';
    } else {
      btn.textContent = '🔔 Aktifkan Notifikasi';
      btn.dataset.active = 'false';
    }

    btn.addEventListener('click', async () => {
      if (btn.dataset.active === 'true') {
        const sub = await registration.pushManager.getSubscription();
        if (sub) await sub.unsubscribe();
        console.log('🧹 Notifikasi dinonaktifkan.');
        btn.textContent = '🔔 Aktifkan Notifikasi';
        btn.dataset.active = 'false';
      } else {
        await PushHelper.requestPermission();
        btn.textContent = '🔕 Nonaktifkan Notifikasi';
        btn.dataset.active = 'true';
      }
    });
  }
}
