import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

import App from './pages/app.js';
import PushHelper from './utils/push-helper.js';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js');
      console.log('✅ Service Worker terdaftar:', registration.scope);

      const readyReg = await navigator.serviceWorker.ready;
      console.log('💪 Service Worker siap digunakan untuk caching & push notification.');

      const permission = Notification.permission;

      if (permission === 'granted') {
        const existingSub = await readyReg.pushManager.getSubscription();
        if (!existingSub) {
          await PushHelper.subscribeUserToPush(readyReg);
          console.log('🔔 Notifikasi aktif dan tersubscribe.');
        } else {
          console.log('✅ Subscription sudah ada, tidak perlu subscribe lagi.');
        }
      } else if (permission === 'default') {
        const newPermission = await PushHelper.requestPermission();
        if (newPermission === 'granted') {
          const existingSub = await readyReg.pushManager.getSubscription();
          if (!existingSub) {
            await PushHelper.subscribeUserToPush(readyReg);
            console.log('🔔 Notifikasi diaktifkan.');
          }
        } else {
          console.warn('🚫 Pengguna menolak notifikasi.');
        }
      } else {
        console.warn('🚫 Notifikasi sudah diblokir di browser.');
      }
    } catch (error) {
      console.error('❌ Pendaftaran Service Worker gagal:', error);
    }
  } else {
    console.warn('⚠️ Browser tidak mendukung Service Worker.');
  }

  const notifToggle = document.querySelector('#notifToggle');
  if (notifToggle) {
    notifToggle.checked = Notification.permission === 'granted';
    notifToggle.addEventListener('change', async (e) => {
      const reg = await navigator.serviceWorker.ready;
      if (e.target.checked) {
        const permission = await PushHelper.requestPermission();
        if (permission === 'granted') {
          const existingSub = await reg.pushManager.getSubscription();
          if (!existingSub) {
            await PushHelper.subscribeUserToPush(reg);
          } else {
            console.log('✅ Subscription sudah ada, tidak perlu subscribe lagi.');
          }
          console.log('🔔 Notifikasi diaktifkan.');
        } else {
          e.target.checked = false;
          console.warn('🚫 Pengguna menolak notifikasi.');
        }
      } else {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          localStorage.removeItem('push-subscription-sent'); 
        }
        console.log('🔕 Notifikasi dinonaktifkan.');
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
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});