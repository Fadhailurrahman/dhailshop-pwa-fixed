export default class NotFoundPage {
    async render() {
      return `
        <section class="container page-transition" id="not-found-page">
          <h1 style="text-align:center; margin-top:50px; color:#dc2626;">❌ Halaman Tidak Ditemukan</h1>
          <p style="text-align:center; margin-top:20px; color:#555;">
            Maaf, halaman yang kamu tuju tidak tersedia.<br>
            Kembali ke <a href="#/">Beranda</a>.
          </p>
        </section>
      `;
    }
  
    async afterRender() {
    }
  }
  