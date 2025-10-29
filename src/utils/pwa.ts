export interface PWAUpdateInfo {
  needRefresh: boolean;
  offlineReady: boolean;
  updateSW: () => Promise<void>;
}

export const registerPWA = (): PWAUpdateInfo => {
  let needRefresh = false;
  let offlineReady = false;

  const updateSW = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW Registered: ', registration);
        offlineReady = true;
        window.dispatchEvent(new CustomEvent('pwa-offline-ready'));

        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                needRefresh = true;
                window.dispatchEvent(new CustomEvent('pwa-update-available', { 
                  detail: { updateSW } 
                }));
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('SW registration error', error);
      });
  }

  return {
    needRefresh,
    offlineReady,
    updateSW,
  };
};

export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
    }
  }
};

export const unregisterSW = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
    }
  }
};