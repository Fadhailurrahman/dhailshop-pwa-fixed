const PushHelper = {
    async requestPermission() {
      if (!('Notification' in window)) {
        console.error('Browser tidak mendukung notifikasi.');
        return;
      }
  
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Izin notifikasi ditolak.');
        return;
      }
  
      console.log('Izin notifikasi diberikan.');
      this.subscribeUserToPush();
    },
  
    async subscribeUserToPush() {
      if (!('serviceWorker' in navigator)) {
        console.error('Service Worker tidak didukung.');
        return;
      }
  
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        console.log('Sudah berlangganan notifikasi.');
        return;
      }
  
      const vapidKey = import.meta.env.VITE_VAPID_KEY_PUBLIC || '<ISI_VAPID_KEY_PUBLIC>';
      const convertedKey = this.urlBase64ToUint8Array(vapidKey);
  
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
  
      console.log('Berhasil berlangganan:', newSubscription);
    },
  
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
  
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);
  
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },
  };
  
  export default PushHelper;
  