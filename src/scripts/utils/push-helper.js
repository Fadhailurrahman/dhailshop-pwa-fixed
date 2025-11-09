const PushHelper = {
  async requestPermission() {
    if (!('Notification' in window)) {
      console.error('❌ Browser tidak mendukung notifikasi.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Izin notifikasi ditolak oleh pengguna.');
        return;
      }

      console.log('✅ Izin notifikasi diberikan.');
      await this.subscribeUserToPush();
    } catch (error) {
      console.error('❌ Terjadi kesalahan saat meminta izin notifikasi:', error);
    }
  },

  async subscribeUserToPush() {
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker tidak didukung.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        console.log('♻️ Subscription lama dihapus. Membuat ulang subscription baru...');
        await subscription.unsubscribe();
      }

      const vapidKey =
        'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      const convertedKey = this.urlBase64ToUint8Array(vapidKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log('📦 Subscription baru:', subscription);
      await this.sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error('❌ Gagal melakukan subscribe push:', error.message);
    }
  },

  async sendSubscriptionToServer(subscription) {
    try {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLV9LMVlaNVh5VkdUZFNTSHgiLCJpYXQiOjE3NjI3MjIxNzV9.EGbZqRMZ5FagiwZYywz6w5f5iaD3BvTExmG-QDR_T0M';

      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        },
      };

      const response = await fetch(
        'https://story-api.dicoding.dev/v1/notifications/subscribe',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log('📡 Response server:', result);

      if (!response.ok) throw new Error(result.message || 'Gagal subscribe ke server.');
      console.log('✅ Berhasil subscribe ke server Dicoding!');
    } catch (error) {
      console.error('❌ Gagal subscribe ke server:', error.message);
    }
  },

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
};

export default PushHelper;
