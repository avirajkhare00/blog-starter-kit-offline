'use client';

import { useEffect, useState } from 'react';

// Define types for Workbox events
interface WorkboxEvent {
  type: string;
  [key: string]: any;
}

interface WaitingEvent extends WorkboxEvent {
  wasWaitingBeforeRegister?: boolean;
}

interface WorkboxInstance {
  addEventListener(event: string, callback: (event: WorkboxEvent) => void): void;
  register(): void;
  messageSkipWaiting(): void;
}

export function PWARegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox as WorkboxInstance;
      
      // Add event listeners to handle PWA lifecycle events
      wb.addEventListener('installed', (event: WorkboxEvent) => {
        console.log(`Event ${event.type} is triggered.`);
        
        if (event.isUpdate) {
          console.log('Service worker update installed');
        } else {
          console.log('Service worker installed for the first time');
          setOfflineReady(true);
          
          // Hide the offline ready message after 4.5 seconds
          setTimeout(() => {
            setOfflineReady(false);
          }, 4500);
        }
      });

      wb.addEventListener('controlling', (event: WorkboxEvent) => {
        console.log(`Event ${event.type} is triggered.`);
        // The service worker is now controlling the page
        // This happens after a skipWaiting() call
        window.location.reload();
      });

      wb.addEventListener('activated', (event: WorkboxEvent) => {
        console.log(`Event ${event.type} is triggered.`);
        // The service worker is now fully activated
        // This is a good time to enable offline functionality
        if ('navigationPreload' in navigator.serviceWorker) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.navigationPreload.enable().catch(() => {
              console.log('Navigation preload not supported');
            });
          });
        }
      });

      // A common UX pattern for progressive web apps is to show a banner when a service worker has updated and waiting to install.
      // NOTE: MUST set skipWaiting to false in next.config.js pwa object
      // https://developers.google.com/web/tools/workbox/guides/advanced-recipes#offer_a_page_reload_for_users
      const promptNewVersionAvailable = (event: WaitingEvent) => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        setUpdateAvailable(true);
        
        // Store the registration for later use
        navigator.serviceWorker.ready.then(reg => {
          setRegistration(reg);
        });
      };

      wb.addEventListener('waiting', promptNewVersionAvailable);

      // Register the service worker after event listeners have been added
      wb.register();
      
      // Check if a service worker is already waiting when the page loads
      navigator.serviceWorker.ready.then(reg => {
        if (reg.waiting) {
          setUpdateAvailable(true);
          setRegistration(reg);
        }
      });
    }
  }, []);

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      // Send a message to the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  return (
    <>
      {updateAvailable && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 flex items-center justify-between z-50">
          <p>A new version is available!</p>
          <div className="flex space-x-2">
            <button 
              onClick={() => setUpdateAvailable(false)}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded"
            >
              Dismiss
            </button>
            <button 
              onClick={updateServiceWorker}
              className="px-3 py-1 bg-white text-blue-600 hover:bg-gray-100 rounded font-medium"
            >
              Update & Reload
            </button>
          </div>
        </div>
      )}
      
      {offlineReady && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white p-4 flex items-center justify-between z-50">
          <p>App ready to work offline!</p>
          <button 
            onClick={() => setOfflineReady(false)}
            className="px-3 py-1 bg-green-700 hover:bg-green-800 rounded"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  );
}

// Add TypeScript interface for Workbox
declare global {
  interface Window {
    workbox: WorkboxInstance;
  }
}
