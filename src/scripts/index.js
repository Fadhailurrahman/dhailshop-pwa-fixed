import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import App from './pages/app.js';
import PushHelper from './utils/push-helper.js';

document.addEventListener('DOMContentLoaded', async () => {
  await PushHelper.requestPermission();

  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ Service Worker terdaftar:', registration.scope);
    } catch (error) {
      console.error('❌ Pendaftaran Service Worker gagal:', error);
    }
  });
}

let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.hidden = false;
  console.log('📦 Event beforeinstallprompt terdeteksi, tombol install ditampilkan.');
});

installButton.addEventListener('click', async () => {
  installButton.hidden = true;
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📲 User memilih: ${outcome}`);
    deferredPrompt = null;
  }
});

window.addEventListener('appinstalled', () => {
  console.log('✅ Aplikasi berhasil diinstall!');
});